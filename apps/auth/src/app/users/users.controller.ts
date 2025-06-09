import { Controller, Get, Param, Put, Delete, Body, UseGuards, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async getAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: Partial<any>) {
        return this.usersService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}