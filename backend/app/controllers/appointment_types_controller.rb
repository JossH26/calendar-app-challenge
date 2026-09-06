class AppointmentTypesController < ApplicationController
  before_action :set_appointment_type, only: %i[ show update destroy ]

  # GET /appointment_types
  def index
    @appointment_types = AppointmentType.all

    render json: @appointment_types
  end

  # GET /appointment_types/1
  def show
    render json: @appointment_type
  end

  # POST /appointment_types
  def create
    @appointment_type = AppointmentType.new(appointment_type_params)

    if @appointment_type.save
      render json: @appointment_type, status: :created, location: @appointment_type
    else
      render json: @appointment_type.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /appointment_types/1
  def update
    if @appointment_type.update(appointment_type_params)
      render json: @appointment_type
    else
      render json: @appointment_type.errors, status: :unprocessable_content
    end
  end

  # DELETE /appointment_types/1
  def destroy
    @appointment_type.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_appointment_type
      @appointment_type = AppointmentType.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def appointment_type_params
      params.require(:appointment_type).permit(:name)
    end
end
