import { prisma } from '../db/prisma.client.js'
import { ApiError } from '../utils/ApiError.js'
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
  const { name, email, password } = req.body

  if(!email.trim() || !password.trim()) 
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
      email,
      hashedPassword
    }
  })

  return res.status(201).json({
    message: 'User registered successfully',
    user: {
        id: user.id,
        name: user.name,        
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at, 
    },
    })
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body

  if(!email.trim() || !password.trim()) 
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
    maxAge: 7 * 60 * 60 * 1000 // 7 days
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
          email: user.email,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        }
    })
}

export const logoutUser = async (req, res) => {
  const loggedOutUser = await prisma.user.findUnique({
    where: { id: req.user.userId },
    data: {
      refreshToken: ""
    }
  })

    // cookie options
  const options = {
    httpOnly: true,
    maxAge: 7 * 60 * 60 * 1000 // 7 days
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