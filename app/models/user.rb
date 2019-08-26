class User < ApplicationRecord
    has_many :plates
    has_many :canvasobjects
    has_one :setting

    validates :name, presence: true, uniqueness:true, length: { maximum: 255 }
    validates :password, presence: true,length: { minimum: 10 },confirmation: true
    validate :add_error_massage

    def add_error_massage
      if name.blank?
        errors.add("ユーザ名を入力して下さい")
      end
    end

    # SessionsControllerにてauthenticateメソッドを使うため
    has_secure_password
end
