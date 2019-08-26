class CreateCanvasobjects < ActiveRecord::Migration[5.2]
  def change
    create_table :canvasobjects do |t|
      t.integer :user_id
      t.integer :tab_id
      t.text    :canvasobjects_json
      t.timestamps
    end
  end
end
