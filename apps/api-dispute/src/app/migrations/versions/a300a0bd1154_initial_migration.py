"""Initial migration

Revision ID: a300a0bd1154
Revises: 
Create Date: 2021-10-21 16:09:19.708945

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a300a0bd1154'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('message_id', sa.String(length=36), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('party1', sa.String(length=42), nullable=True),
    sa.Column('party2', sa.String(length=42), nullable=True),
    sa.Column('contract', sa.String(length=42), nullable=True),
    sa.Column('data', sa.JSON(), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_id'), 'events', ['id'], unique=False)
    op.create_index(op.f('ix_events_message_id'), 'events', ['message_id'], unique=True)
    op.create_index(op.f('ix_events_party1'), 'events', ['party1'], unique=False)
    op.create_index(op.f('ix_events_party2'), 'events', ['party2'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_events_party2'), table_name='events')
    op.drop_index(op.f('ix_events_party1'), table_name='events')
    op.drop_index(op.f('ix_events_message_id'), table_name='events')
    op.drop_index(op.f('ix_events_id'), table_name='events')
    op.drop_table('events')
    # ### end Alembic commands ###