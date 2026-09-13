class Appointment < ApplicationRecord
  belongs_to :appointment_type
  validates :description, presence: true
end
