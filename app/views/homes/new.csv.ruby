require 'csv'
require 'nkf'

csv_str =CSV.generate do |csv|
  column_names = %w(text group created_at updated_at)
  csv << column_names
  @plates.each do |plate|
    column_values = [
      plate.text,
      plate.group.name,
      plate.updated_at,
      plate.created_at,
    ]
    csv << column_values
  end
end

NKF::nkf('--sjis -Lw', csv_str)