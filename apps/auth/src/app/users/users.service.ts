// shared/users/users.service.ts
import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userModel.findOne({ email }).exec();
    }

    async create(user: Partial<User>): Promise<User> {
        const created = new this.userModel(user);
        return created.save();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const updated = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!updated) throw new NotFoundException('User not found');
        return updated;
    }

    async remove(id: string): Promise<User> {
        const deleted = await this.userModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('User not found');
        return deleted;
    }
}