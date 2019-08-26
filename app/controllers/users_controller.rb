class UsersController < ApplicationController
    
    def show
        @User = User.new
    end
    
    def create
        @User = User.new(users_params)
        @User.login_count = 0
        if @User.save then
            render 'show'
        else    
            render 'show'
        end
    end

    private
    def users_params
        params.require(:user).permit(:name,:password,:password_confirmation)
    end
end
