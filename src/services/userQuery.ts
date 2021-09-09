import { UserRepository } from '../repositories/user/userRepository'

export class UserQuery {
    userRepository: UserRepository

    constructor() {
        this.userRepository = new UserRepository()
    }

    async getListAsync(qs?: any) {
        return {
            data: await this.userRepository.getListAsync(qs),
        }
    }

    async getDetailAsync(id: string) {
        const userDetail = await this.userRepository.getDetailAsync(id)
        return userDetail
    }
}
