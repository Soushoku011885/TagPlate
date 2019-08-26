class Tag < ApplicationRecord
    has_many :linkplatetags
    has_many :plates, through: :linkplatetags
end
