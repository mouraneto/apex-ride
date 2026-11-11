"""initial_schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-11-11 20:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('name', sa.VARCHAR(255), nullable=False),
        sa.Column('email', sa.VARCHAR(255), nullable=False),
        sa.Column('password_hash', sa.VARCHAR(255), nullable=False),
        sa.Column('role', sa.Enum('PILOT', 'OPERATOR', name='userrole'), nullable=False, server_default='PILOT'),
        sa.Column('cnh_number', sa.VARCHAR(50), nullable=True),
        sa.Column('phone', sa.VARCHAR(50), nullable=False),
        sa.Column('emergency_contact', sa.VARCHAR(255), nullable=False),
        sa.Column('blood_type', sa.VARCHAR(10), nullable=False),
        sa.Column('sus_card', sa.VARCHAR(50), nullable=True),
        sa.Column('pilot_level', sa.Enum('INICIANTE', 'AMADOR', 'INTERMEDIARIO', 'AVANCADO', 'PROFISSIONAL', name='pilotlevel'), nullable=False, server_default='INICIANTE'),
        sa.Column('helmet_size', sa.VARCHAR(10), nullable=True),
        sa.Column('suit_size', sa.VARCHAR(10), nullable=True),
        sa.Column('glove_size', sa.VARCHAR(10), nullable=True),
        sa.Column('boot_size', sa.VARCHAR(10), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp(), onupdate=sa.func.current_timestamp()),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_role', 'users', ['role'])

    # 2. tracks
    op.create_table(
        'tracks',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('name', sa.VARCHAR(255), nullable=False),
        sa.Column('location', sa.VARCHAR(255), nullable=False),
        sa.Column('length_km', sa.DECIMAL(5, 2), nullable=False),
        sa.Column('hourly_rate', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('image_url', sa.VARCHAR(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_tracks_active', 'tracks', ['is_active'])

    # 3. motorcycles
    op.create_table(
        'motorcycles',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('track_id', sa.VARCHAR(36), sa.ForeignKey('tracks.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False),
        sa.Column('brand', sa.VARCHAR(100), nullable=False),
        sa.Column('model', sa.VARCHAR(100), nullable=False),
        sa.Column('cc', sa.Integer(), nullable=False),
        sa.Column('base_top_speed', sa.Integer(), nullable=False),
        sa.Column('base_hourly_price', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('image_url', sa.VARCHAR(500), nullable=True),
        sa.Column('status', sa.Enum('AVAILABLE', 'RENTED', 'MAINTENANCE', name='motorcyclestatus'), nullable=False, server_default='AVAILABLE'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_motorcycles_track_status', 'motorcycles', ['track_id', 'status'])

    # 4. equipments
    op.create_table(
        'equipments',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('name', sa.VARCHAR(100), nullable=False),
        sa.Column('category', sa.Enum('HELMET', 'SUIT', 'GLOVES', 'BOOTS', name='equipmentcategory'), nullable=False),
        sa.Column('daily_price', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('available_sizes', sa.VARCHAR(100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_equipments_category', 'equipments', ['category'])

    # 5. group_bookings
    op.create_table(
        'group_bookings',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('leader_user_id', sa.VARCHAR(36), sa.ForeignKey('users.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False),
        sa.Column('group_name', sa.VARCHAR(150), nullable=False),
        sa.Column('invite_code', sa.VARCHAR(20), nullable=False),
        sa.Column('status', sa.Enum('OPEN', 'CLOSED', 'COMPLETED', name='groupstatus'), nullable=False, server_default='OPEN'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_group_invite_code', 'group_bookings', ['invite_code'], unique=True)

    # 6. rentals
    op.create_table(
        'rentals',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('rental_uuid', sa.VARCHAR(36), nullable=False),
        sa.Column('user_id', sa.VARCHAR(36), sa.ForeignKey('users.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False),
        sa.Column('motorcycle_id', sa.VARCHAR(36), sa.ForeignKey('motorcycles.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False),
        sa.Column('track_id', sa.VARCHAR(36), sa.ForeignKey('tracks.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False),
        sa.Column('group_booking_id', sa.VARCHAR(36), sa.ForeignKey('group_bookings.id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('total_price', sa.DECIMAL(10, 2), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', name='rentalstatus'), nullable=False, server_default='CONFIRMED'),
        sa.Column('effective_speed_limit', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_rentals_uuid', 'rentals', ['rental_uuid'], unique=True)
    op.create_index('idx_rentals_schedule', 'rentals', ['motorcycle_id', 'start_time', 'end_time'])
    op.create_index('idx_rentals_user_history', 'rentals', ['user_id', 'status'])

    # 7. rental_equipments
    op.create_table(
        'rental_equipments',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('rental_id', sa.VARCHAR(36), sa.ForeignKey('rentals.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False),
        sa.Column('equipment_id', sa.VARCHAR(36), sa.ForeignKey('equipments.id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False),
        sa.Column('chosen_size', sa.VARCHAR(10), nullable=False),
        sa.Column('price_at_booking', sa.DECIMAL(10, 2), nullable=False),
    )

    # 8. telemetry_logs
    op.create_table(
        'telemetry_logs',
        sa.Column('id', sa.VARCHAR(36), primary_key=True, nullable=False),
        sa.Column('rental_id', sa.VARCHAR(36), sa.ForeignKey('rentals.id', ondelete='CASCADE', onupdate='CASCADE'), nullable=False),
        sa.Column('lap_number', sa.Integer(), nullable=False),
        sa.Column('lap_time_seconds', sa.DECIMAL(6, 3), nullable=False),
        sa.Column('max_speed_kmh', sa.DECIMAL(5, 2), nullable=False),
        sa.Column('avg_speed_kmh', sa.DECIMAL(5, 2), nullable=False),
        sa.Column('max_g_force', sa.DECIMAL(3, 2), nullable=False),
        sa.Column('falls_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.current_timestamp()),
    )
    op.create_index('idx_telemetry_rental_lap', 'telemetry_logs', ['rental_id', 'lap_number'])
    op.create_index('idx_telemetry_leaderboard', 'telemetry_logs', ['max_speed_kmh', 'avg_speed_kmh'])


def downgrade() -> None:
    op.drop_table('telemetry_logs')
    op.drop_table('rental_equipments')
    op.drop_table('rentals')
    op.drop_table('group_bookings')
    op.drop_table('equipments')
    op.drop_table('motorcycles')
    op.drop_table('tracks')
    op.drop_table('users')
