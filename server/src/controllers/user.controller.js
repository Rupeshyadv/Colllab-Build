import { prisma } from '../db/prisma.client.js'
import { ApiError } from '../utils/ApiError.js'
import { upload_on_cloudinary } from '../services/fileUploadService/cloudinary.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
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
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
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