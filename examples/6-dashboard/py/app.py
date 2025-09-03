from shiny import App, Inputs, Outputs, Session, ui, reactive
from shinyreact import page_react_app, render_object
from data import generate_sample_data, filter_data, calculate_metrics
from pathlib import Path

# Generate sample data once when app starts
sample_data = generate_sample_data()


def server(input: Inputs, output: Outputs, session: Session):

    @reactive.calc
    def filtered_data():
        """Reactive data filtering"""
        # Get input values with defaults
        date_range = (
            input.date_range() if input.date_range() is not None else "last_30_days"
        )
        search_term = input.search_term() if input.search_term() is not None else ""
        selected_categories = (
            input.selected_categories()
            if input.selected_categories() is not None
            else []
        )

        return filter_data(
            sample_data,
            date_range=date_range,
            search_term=search_term,
            selected_categories=selected_categories,
        )

    @render_object
    def metrics_data():
        """Calculate and return metrics"""
        data = filtered_data()
        return calculate_metrics(data)

    @render_object
    def chart_data():
        """Return chart data in column-major format"""
        data = filtered_data()

        # Convert DataFrames to column-major format (dict with column arrays)
        revenue_trend_columns = data["revenue_trend"].to_dict("list")
        category_performance_columns = data["category_performance"].to_dict("list")

        return {
            "revenue_trend": revenue_trend_columns,
            "category_performance": category_performance_columns,
        }

    @render_object
    def table_data():
        """Return table data in column-major format"""
        data = filtered_data()

        # Sort products by revenue (descending) and take top 10
        products = data["products"].copy()
        if len(products) > 0:
            products_sorted = products.sort_values("revenue", ascending=False)
            top_products = products_sorted.head(10)

            # Convert to column-major format (dict with column arrays)
            columns_data = top_products.to_dict("list")
        else:
            # Return empty columns with correct structure
            columns_data = {
                "id": [],
                "product": [],
                "category": [],
                "sales": [],
                "revenue": [],
                "growth": [],
                "status": [],
            }

        return {"columns": columns_data, "total_rows": len(data["products"])}


app = App(
    page_react_app(title="Dashboard - Shiny React"),
    server,
    static_assets=str(Path(__file__).parent / "www"),
)
