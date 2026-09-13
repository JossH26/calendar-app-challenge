class AddParticipantsToAppointments < ActiveRecord::Migration[7.2]
  def change
    add_column :appointments, :participants, :string
  end
end
