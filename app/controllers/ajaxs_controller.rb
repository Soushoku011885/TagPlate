class AjaxsController < ApplicationController
  def new
  end


  def create

    # ここではパースしません。
    # fabric.jsが、jsonを読み込む際にしてくれるっぽい
    json_hash = request.body.read

    if request.headers[:Accept] == '*/*' then 

      # レイアウト保存処理
      setting = Setting.find_by(user_id: session[:user_id])
      setting.update(classname: json_hash)
    else

      # キャンバス保存処理
      canvsobj = Canvasobject.find_by(user_id: session[:user_id])
      if canvsobj.present? then
        canvsobj.update(canvasobjects_json: json_hash)
      else
        newcanvasobj = Canvasobject.new()
        newcanvasobj.user_id = session[:user_id]
        newcanvasobj.canvasobjects_json = json_hash
        newcanvasobj.save
      end 
    end
  end
end
