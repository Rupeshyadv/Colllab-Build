import { prisma } from '../db/prisma.client.js'
import { ApiError } from '../utils/ApiError.js'
import { upload_on_cloudinary } from '../services/fileUploadService/cloudinary.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { google } from 'googleapis'

export const generateAccessAndRefreshTokens = async (user) => {
  try {
    const payload = {
      userId: user.id, 
      email: user.email,
    }

    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
    )
    
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    )

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, 'Error generating tokens')
  }
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// this func gets called when user clicks on "Login with Google" button
export const getGoogleAuthURL = (req, res) => {
  const scopes = ['profile', 'email']

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  return res.status(200).json({ url })
}

// this func gets called by google 
export const googleOAuthCallback = async (req, res) => {
  const code = req.query.code
  if (!code) {
    throw new ApiError(400, 'Authorization code not provided')
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    const oauth2 = google.oauth2({
      version: 'v2',
      auth: oauth2Client,
    })

    const { data } = await oauth2.userinfo.get()

    const { id, email, name, picture } = data
    
    // check if user exists by googleId
    let user = await prisma.user.findUnique({
      where: { id }
    })
    
    // if not, check if user exists by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email }
      })

      // if user exists with email, update googleId and provider
      if (user) {
        user = await prisma.user.update({
          where: { email },
          data: {
            googleId: id,
            provider: 'google',
          }
        })
      }
      // if not, create new user
      else {
        user = await prisma.user.create({
          data: {
            name,
            username: email.split('@')[0],
            email,
            googleId: id,
            provider: 'google',
          }
        })
      }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user)

    const options = {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      secure: true,
      sameSite: 'none',
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect('https://colllab-build.onrender.com/dashboard') 
  } catch (error) {
    console.error('Error during Google OAuth callback:', error)
    throw new ApiError(500, 'Error during Google OAuth process')
  }

}

export const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body

  if(!email.trim() || !password.trim() || !username.trim()) 
    throw new ApiError(400,  'All fields are required')

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new ApiError(400, 'User with this email or username already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      hashedPassword
    }
  })

  return res.status(201).json({
    message: 'User registered successfully',
    user: {
        id: user.id,
        name: user.name,    
        username: user.username,    
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at, 
    },
    })
}

export const loginUser = async (req, res) => {
  const { email, username, password } = req.body

  if(!email.trim() || !password.trim() || !username.trim()) 
    throw new ApiError(400, 'Email/Username and password are required')

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user)

    // cookie options
  const options = {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    secure: true,
    sameSite: "none",
  }

  // adding tokens to json response for postman testing
  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }
    })
}

export const logoutUser = async (req, res) => {
  const userId = req.user?.id;  
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }

  const loggedOutUser = await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: ""
    }
  })

    // cookie options
  const options = {
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    secure: true,
    sameSite: 'none',
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      { 
        message: "Logout successful",
        user: {
          id: loggedOutUser.id,
          name: loggedOutUser.name,
          email: loggedOutUser.email,
          createdAt: loggedOutUser.created_at,
          updatedAt: loggedOutUser.updated_at
        }
      }
    )
}

export const eidtUserProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: "User ID not found" });
  }

  const { username } = req.body
  const file = req.file
  let cloudinaryUrl = null;

  try {
    if (file?.path)
      cloudinaryUrl = await upload_on_cloudinary(file.path)

    // push into db
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || undefined,
        avatarUrl: cloudinaryUrl?.secure_url || undefined,
      }
    })

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      }
    })
  } catch (error) {
    console.error("Error in eidtUserProfile:", error)
    return res.status(500).json({ message: "Error updating profile" })
  }

}