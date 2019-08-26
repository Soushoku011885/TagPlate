class CreateSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :settings do |t|
      t.integer  :user_id
      t.text     :classname
      t.boolean  :usingsnap
      t.text     :snapdist
      t.boolean  :usinggrid
      t.timestamps
    end
  end
end
