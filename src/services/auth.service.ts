// src/services/auth.service.ts
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { NewUser, User } from '@/types';

const SALT_ROUNDS = 12;

export class AuthService {
  static async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  static async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<Omit<User, 'password'>> {
    const existing = await this.findUserByEmail(input.email);
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const newUser: NewUser = {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    };

    const [created] = await db.insert(users).values(newUser).returning();

    const { password, ...safeUser } = created;
    return safeUser;
  }

  static async validateCredentials(
    email: string,
    password: string
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}