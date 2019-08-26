class CreatePlates < ActiveRecord::Migration[5.2]
  def change
    create_table :plates do |t|
      t.integer  :user_id
      t.integer  :tab_id
      t.text     :text
      t.integer  :group_id
      t.timestamps
    end
  end
end
