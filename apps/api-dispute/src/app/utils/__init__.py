def event_schema_class(event_type: str) -> str:
    category, _, action = event_type.split('.')
    return f'{category.title()}{action.title()}Event'
