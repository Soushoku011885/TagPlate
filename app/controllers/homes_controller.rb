class HomesController < ApplicationController
    before_action :user_logged_in?

    def user_logged_in?
      if session[:user_id]
        begin
          @current_user = User.find_by(id: session[:user_id])
        rescue ActiveRecord::RecordNotFound
          reset_user_session
        end
      end
      return if @current_user
      # @current_userが取得できなかった場合はログイン画面にリダイレクト
      flash[:referer] = request.fullpath
      redirect_to user_path
    end
    
    def reset_user_session
      session[:user_id] = nil
      @current_user = nil
    end

    require 'csv'

    def new
        @plates = Plate.includes(:group).where(user_id: session[:user_id])
        respond_to do |format|
            format.csv do
                send_posts_csv(@plates)
            end
        end
    end
    # ＣＳＶ作成＆出力
    def send_posts_csv(plates)
        csv_data = CSV.generate do |csv|
            header = %w(text group created_at updated_at)
            csv << header
    
            plates.each do |plate|
                values = [
                    plate.text,
                    plate.group.name,
                    plate.updated_at,
                    plate.created_at,
                ]
                csv << values
            end 
        end
        send_data(csv_data, filename: "TagPlate.csv")
    end

    def show
        @table   = Plate.new
        @group   = Group.new
        @setting = Setting.find_by(user_id: session[:user_id])
        @tables  = Plate.includes(:group).where(user_id: session[:user_id]).order(created_at: 'DESC')
        @count   = @tables.length
        @object  = Canvasobject.find_by(user_id: session[:user_id])
    end

    def create
        if params[:group].nil? then 
            # プレート登録処理
            table = Plate.new(plates_params)
            table.user_id = session[:user_id]
            table.save!
            
            newplate =  Plate.where(user_id: session[:user_id]).last
            adding   =  Group.select('name').find_by(id: newplate.group_id,user_id: session[:user_id]).name
            newplate = [newplate] + [adding]
            render json: newplate
        else
            # グループ登録処理
            group = Group.new(plates_params)
            group.user_id = session[:user_id]
            group.save!
        end
    end

    private
    def plates_params
        if params[:group].nil? then
            return params.require(:plate).permit(:text,:group_id)
        else
            return params.require(:group).permit(:name)
        end
    end
end
