class CreateTabs < ActiveRecord::Migration[5.2]
  def change
    create_table :tabs do |t|
      t.text     :name
      t.text     :backcolor   
      t.timestamps
    end
  end
end
