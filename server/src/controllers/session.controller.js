import { prisma } from '../db/prisma.client.js'

export const createSession = async (req, res) => {
    try {
        const session = await prisma.session.create({
            data: {
                title: req.body?.title || 'Untitled Session',
                language: req.body?.language || 'en',
                host_user: {
                    connect: {
                        id: req.user.id
                    }
                },
                participants: {
                    create: {
                        isHost: true,
                        user: {
                            connect: {
                                id: req.user.id
                            }
                        }
                    }
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        isHost: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                created_at: true,
                                updated_at: true
                            }
                        }
                    }
                },
            }
            
        })
        
        return res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getSessions = async (req, res) => {
    try {
        const userId = req.user.id

        if (!userId) {
            return res.status(400).json({ error: 'user ID is required' });   
        }

        const sessions = await prisma.session.findMany({
            where: {
                OR: [
                    {
                        host_user_id: userId,
                    },
                    {
                        participants: {
                            some: {
                                user_id: userId,
                            }
                        }
                    }
                ]
            },
            include: {
                host_user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        isHost: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                created_at: true,
                                updated_at: true
                            }
                        }
                    }
                }
            }
        })
        
        if (!sessions) {
            return res.status(404).json({ error: 'Sessions are not found' });
        }

        return res.status(200).json(sessions);
    } catch (error) {
        console.error('Error fetching session:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const joinSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
            }
        })

        if (!session) {
            return res.status(404).json({ error: 'Session not found' })
        }

        const participantExists = await prisma.participant.findUnique({
            where: {
                user_id_session_id: {
                    user_id: req.user.id,
                    session_id: sessionId
                }
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                session: true
            }
        })

        if (participantExists) {
            return res.status(200).json(participantExists);
        }

        const participant = await prisma.participant.create({
            data: {
                user: {
                    connect: {
                        id: req.user.id
                    }
                },
                session: {
                    connect: {
                        id: sessionId
                    }
                },
                isHost: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        created_at: true,
                        updated_at: true
                    }
                },
                session: true
            }
        });
        
        if (!participant) {
            return res.status(500).json({ error: 'Failed to join session' });   
        }

        return res.status(200).json(participant);
    } catch (error) {
        console.error('Error joining session:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 

export const getCode = async (req, res) => {
    try {
        const {sessionId} = req.params
        const code = await prisma.session.findUnique({
            where: {
                id: sessionId
            },
            select: {
                code: true
            }
        })
        
        return res.status(200).json(code);
    } catch (error) {
        console.error('Error fetching code:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const patchCode = async (req, res) => {
    try {
        const {sessionId} = req.params  
        const {code} = req.body

        const updatedCode = await prisma.session.update({
            where: {
                id: sessionId
            },
            data: {
                code: code,
            },
            select: {
                code: true
            }
        })
        return res.status(200).json(updatedCode);
    } catch (error) {
        console.error('Error updating code:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}