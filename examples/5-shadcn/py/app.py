from shiny import App, Inputs, Outputs, Session, ui, reactive
from utils import page_bare, render_object, generate_sample_data, filter_data, calculate_metrics
from pathlib import Path
import pandas as pd

# Generate sample data once when app starts
sample_data = generate_sample_data()

app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="Shiny React Dashboard",
)

def server(input: Inputs, output: Outputs, session: Session):
    
    @reactive.calc
    def filtered_data():
        """Reactive data filtering"""
        # Get input values with defaults
        date_range = input.date_range() if input.date_range() is not None else "last_30_days"
        search_term = input.search_term() if input.search_term() is not None else ""
        selected_categories = input.selected_categories() if input.selected_categories() is not None else []
        
        return filter_data(
            sample_data,
            date_range=date_range,
            search_term=search_term,
            selected_categories=selected_categories
        )
    
    @render_object()
    def metrics_data():
        """Calculate and return metrics"""
        data = filtered_data()
        return calculate_metrics(data)
    
    @render_object()
    def chart_data():
        """Return chart data"""
        data = filtered_data()
        
        # Convert DataFrames to lists of dictionaries for JSON serialization
        revenue_trend_list = data['revenue_trend'].to_dict('records')
        category_performance_list = data['category_performance'].to_dict('records')
        
        return {
            'revenue_trend': revenue_trend_list,
            'category_performance': category_performance_list
        }
    
    @render_object()
    def table_data():
        """Return table data"""
        data = filtered_data()
        
        # Sort products by revenue (descending) and take top 10
        products = data['products'].copy()
        if len(products) > 0:
            products_sorted = products.sort_values('revenue', ascending=False)
            top_products = products_sorted.head(10)
            
            # Convert to list of dictionaries
            rows = top_products.to_dict('records')
        else:
            rows = []
        
        return {
            'rows': rows,
            'total_rows': len(data['products'])
        }
    
    @reactive.effect
    def debug_inputs():
        """Debug: Print input changes"""
        print(f"Date range: {input.date_range()}")
        print(f"Search term: {input.search_term()}")
        print(f"Selected categories: {input.selected_categories()}")
        print("---")

app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))