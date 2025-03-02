"""Add relationship between Product and Rating

Revision ID: 4afdb49dd837
Revises: 1a5099b9e836
Create Date: 2025-02-15 22:39:29.202346

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4afdb49dd837'
down_revision: Union[str, None] = '1a5099b9e836'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('products', 'description',
               existing_type=sa.VARCHAR(),
               type_=sa.Text(),
               existing_nullable=True)
    op.drop_constraint('ratings_product_id_fkey', 'ratings', type_='foreignkey')
    op.drop_constraint('ratings_user_id_fkey', 'ratings', type_='foreignkey')
    op.create_foreign_key(None, 'ratings', 'products', ['product_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'ratings', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'ratings', type_='foreignkey')
    op.drop_constraint(None, 'ratings', type_='foreignkey')
    op.create_foreign_key('ratings_user_id_fkey', 'ratings', 'users', ['user_id'], ['id'])
    op.create_foreign_key('ratings_product_id_fkey', 'ratings', 'products', ['product_id'], ['id'])
    op.alter_column('products', 'description',
               existing_type=sa.Text(),
               type_=sa.VARCHAR(),
               existing_nullable=True)
    # ### end Alembic commands ###
