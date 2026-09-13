class AddColorToAppointmentTypes < ActiveRecord::Migration[7.2]
  def change
    add_column :appointment_types, :color, :string
  end
end
