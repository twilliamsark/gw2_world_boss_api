import { Request, Response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
}

// Temporary in-memory data store
const users: User[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com' },
];

export const getUsers = (req: Request, res: Response): void => {
  res.status(200).json(users);
};

export const createUser = (req: Request, res: Response): void => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ message: 'Name and email are required' });
    return;
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};
