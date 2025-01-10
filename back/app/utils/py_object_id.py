from bson import ObjectId
from pydantic_core import core_schema, CoreSchema
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: type, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        """
        Define un esquema personalizado para validar ObjectId en Pydantic.
        """

        def validate(value: str) -> ObjectId:
            if not ObjectId.is_valid(value):
                raise ValueError(f"Invalid ObjectId: {value}")
            return ObjectId(value)

        return core_schema.no_info_plain_validator_function(validate)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> dict:
        """
        Define cómo se serializa ObjectId a JSON.
        """
        json_schema = handler(schema)
        json_schema.update(type="string", example="60d5f483734d1d6c8c8e6d42")
        return json_schema
