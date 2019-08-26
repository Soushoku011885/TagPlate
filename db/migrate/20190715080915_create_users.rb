class CreateUsers < ActiveRecord::Migration[5.2]
  def change
    create_table  :users do |t|
      t.text      :name
      t.text      :password_digest
      t.integer   :login_count
      t.timestamps
    end
  end
end
