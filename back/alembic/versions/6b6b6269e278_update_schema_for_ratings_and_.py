"""Update schema for ratings and comparisons

Revision ID: 6b6b6269e278
Revises: 4afdb49dd837
Create Date: 2025-02-15 22:41:28.829508

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6b6b6269e278'
down_revision: Union[str, None] = '4afdb49dd837'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
