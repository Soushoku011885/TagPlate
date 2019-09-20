class SessionsController < ApplicationController
  def new
  end

  def destroy
    # ログアウト
    session[:user_id] = nil
    redirect_to :controller => 'users', :action => 'show'
  end

  def create
    user = User.find_by(name: params[:session][:name])

    if user && user.authenticate(params[:session][:password_digest])
      # ログイン
      session[:user_id] = user.id
      # 初期値追加ゾーン！！！！！
      if user.login_count == 0 then

          groups = ['グループ１','グループ２','グループ３']
          for group in groups
            initgroup         = Group.new()
            initgroup.user_id = user.id
            initgroup.name    = group
            initgroup.save
          end
    
          groupid = Group.select('id').where(user_id: user.id).first

          # 初めてのプレート追加
          firstplate          = Plate.new()
          firstplate.user_id  = user.id
          firstplate.text     = 'TagPlateへのユーザ登録ありがとうございます!さっそくですが、このプレートを右側のキャンバスにドラッグしてみてください。'
          firstplate.group_id = groupid.id
          firstplate.save
    
          settings = Setting.new()
          settings.user_id        = user.id
          settings.classname      = '16 1 1.5 1 250 #008080 #50d2d2'
          settings.usingsnap      = 'false'
          settings.snapdist       = '5px'
          settings.usinggrid      = 'false'
          settings.save

          canvasobjects         = Canvasobject.new()
          canvasobjects.user_id = user.id
          # とりあえずリテラルで(;^ω^)
          canvasobjects.canvasobjects_json = '{"version":"3.3.0","background":"white"}'
          canvasobjects.save
      end

      user.update_attribute(:login_count, user.login_count + 1)

      redirect_to home_url(user)
    else
      # エラーメッセージを作成する
      redirect_to :controller => 'users', :action => 'show',:message => 'ユーザ名もしくはパスワードが違います'
      # render ('users/show')
    end
  end
end
