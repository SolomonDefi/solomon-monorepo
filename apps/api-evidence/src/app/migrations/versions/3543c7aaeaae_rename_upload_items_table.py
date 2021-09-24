"""Rename upload_items table

Revision ID: 3543c7aaeaae
Revises: 8d1846e367ef
Create Date: 2021-09-23 08:27:16.177821+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3543c7aaeaae'
down_revision = '8d1846e367ef'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'evidences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('storage_backend', sa.String(), nullable=False),
        sa.Column('file_key', sa.String(), nullable=False),
        sa.Column('media_type', sa.String(), nullable=False),
        sa.Column('created', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_evidences_id'), 'evidences', ['id'], unique=False)
    op.drop_index('ix_upload_items_id', table_name='upload_items')
    op.drop_table('upload_items')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'upload_items',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('owner_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ['owner_id'], ['users.id'], name='upload_items_owner_id_fkey'
        ),
        sa.PrimaryKeyConstraint('id', name='upload_items_pkey'),
    )
    op.create_index('ix_upload_items_id', 'upload_items', ['id'], unique=False)
    op.drop_index(op.f('ix_evidences_id'), table_name='evidences')
    op.drop_table('evidences')
    # ### end Alembic commands ###
