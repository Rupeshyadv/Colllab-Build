import { prisma } from '../db/prisma.client.js'

export const createSession = async (req, res) => {
    try {

        const session = await prisma.session.create({
            data: {
                title: req.body?.title || 'Untitled Session',
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
                user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    created_at: true,
                    updated_at: true
                }
                }
            }
            
        })
        
        return res.status(201).json(session);
    } catch (error) {
        console.error('Error creating session:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getSession = async (req, res) => {
    try {
        const { sessionId }  = req.params

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });   
        }

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId
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
                                username: true,
                                created_at: true,
                                updated_at: true
                            }
                        }
                    }
                }
            }
        })
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        return res.status(200).json(session);
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
                        username: true,
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