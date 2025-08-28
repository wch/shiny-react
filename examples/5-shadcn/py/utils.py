import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer

# Bare page without default Shiny styling
def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )

# Custom renderer for arbitrary JSON data
class render_object(Renderer[Jsonifiable]):
    """Reactively render arbitrary JSON object."""
    
    def __init__(self, _fn: Optional = None) -> None:
        super().__init__(_fn)
    
    async def transform(self, value: Any) -> Jsonifiable:
        return value

def generate_sample_data(n_days: int = 30, n_products: int = 20) -> Dict[str, Any]:
    """Generate sample sales data"""
    np.random.seed(42)  # For reproducible data
    
    # Date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=n_days - 1)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Product categories
    categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports"]
    products = [
        "Wireless Headphones", "Laptop Stand", "Smart Watch", "Bluetooth Speaker", "Phone Case",
        "Cotton T-Shirt", "Jeans", "Sneakers", "Wool Sweater", "Baseball Cap",
        "Programming Book", "Novel", "Cookbook", "Journal", "Art Supplies",
        "Garden Tools", "Kitchen Utensils", "Bedding Set", "Decorative Pillow", "Plant Pot"
    ]
    
    # Generate time series data
    revenue_base = 2000 + 500 * np.sin(np.arange(len(dates)) * 0.3) + np.random.normal(0, 200, len(dates))
    orders_base = 50 + 20 * np.sin(np.arange(len(dates)) * 0.2) + np.random.poisson(10, len(dates))
    users_base = 25 + 15 * np.sin(np.arange(len(dates)) * 0.25) + np.random.poisson(5, len(dates))
    
    revenue_trend = pd.DataFrame({
        'date': dates.strftime('%Y-%m-%d'),
        'revenue': np.maximum(1000, revenue_base),
        'orders': np.maximum(10, orders_base),
        'users': np.maximum(5, users_base)
    })
    
    # Generate product performance data
    product_data = pd.DataFrame({
        'id': [f'prod_{i}' for i in range(1, n_products + 1)],
        'product': np.random.choice(products, n_products),
        'category': np.random.choice(categories, n_products),
        'sales': np.random.randint(50, 501, n_products),
        'revenue': np.round(np.random.uniform(1000, 10000, n_products), 2),
        'growth': np.round(np.random.uniform(-15, 25, n_products), 1),
        'status': np.random.choice(['active', 'inactive', 'low_stock'], n_products, p=[0.6, 0.2, 0.2])
    })
    
    # Generate category performance data
    category_performance = product_data.groupby('category').agg({
        'sales': 'sum',
        'revenue': 'sum'
    }).reset_index()
    
    return {
        'revenue_trend': revenue_trend,
        'products': product_data,
        'category_performance': category_performance
    }

def filter_data(data: Dict[str, Any], date_range: str = "last_30_days", 
                search_term: str = "", selected_categories: List[str] = None) -> Dict[str, Any]:
    """Filter data based on inputs"""
    if selected_categories is None:
        selected_categories = []
    
    # Filter by date range (for time series data)
    days_back = {
        "last_7_days": 7,
        "last_30_days": 30,
        "last_90_days": 90,
        "this_year": 365
    }.get(date_range, 30)
    
    start_date = datetime.now().date() - timedelta(days=days_back - 1)
    revenue_trend = data['revenue_trend'].copy()
    revenue_trend['date_parsed'] = pd.to_datetime(revenue_trend['date']).dt.date
    filtered_revenue = revenue_trend[revenue_trend['date_parsed'] >= start_date].drop('date_parsed', axis=1)
    
    # Filter products
    filtered_products = data['products'].copy()
    
    # Filter by search term
    if search_term:
        mask = (
            filtered_products['product'].str.contains(search_term, case=False, na=False) |
            filtered_products['category'].str.contains(search_term, case=False, na=False)
        )
        filtered_products = filtered_products[mask]
    
    # Filter by categories
    if selected_categories:
        # Map category values to labels
        category_map = {
            "electronics": "Electronics",
            "clothing": "Clothing", 
            "books": "Books",
            "home": "Home & Garden",
            "sports": "Sports"
        }
        selected_labels = [category_map.get(cat) for cat in selected_categories if cat in category_map]
        selected_labels = [label for label in selected_labels if label is not None]
        
        if selected_labels:
            filtered_products = filtered_products[filtered_products['category'].isin(selected_labels)]
    
    # Recalculate category performance based on filtered products
    if len(filtered_products) > 0:
        filtered_category_performance = filtered_products.groupby('category').agg({
            'sales': 'sum',
            'revenue': 'sum'
        }).reset_index()
    else:
        filtered_category_performance = pd.DataFrame({
            'category': [],
            'sales': [],
            'revenue': []
        })
    
    return {
        'revenue_trend': filtered_revenue,
        'products': filtered_products,
        'category_performance': filtered_category_performance
    }

def calculate_metrics(current_data: Dict[str, Any], previous_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Calculate metrics with comparison to previous period"""
    
    # Current metrics
    current_revenue = current_data['revenue_trend']['revenue'].sum()
    current_users = current_data['revenue_trend']['users'].sum()
    current_orders = current_data['revenue_trend']['orders'].sum()
    current_conversion = (current_orders / current_users * 100) if current_users > 0 else 0
    
    # Previous metrics (mock calculation for demo)
    previous_revenue = current_revenue * 0.9
    previous_users = current_users * 0.85
    previous_orders = current_orders * 0.88
    previous_conversion = (previous_orders / previous_users * 100) if previous_users > 0 else 0
    
    # Calculate changes
    revenue_change = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
    users_change = ((current_users - previous_users) / previous_users * 100) if previous_users > 0 else 0
    orders_change = ((current_orders - previous_orders) / previous_orders * 100) if previous_orders > 0 else 0
    conversion_change = current_conversion - previous_conversion
    
    return {
        'revenue': {
            'title': 'Total Revenue',
            'value': f'${int(current_revenue):,}',
            'change': round(revenue_change, 1),
            'trend': 'up' if revenue_change >= 0 else 'down'
        },
        'users': {
            'title': 'New Users',
            'value': f'{int(current_users):,}',
            'change': round(users_change, 1),
            'trend': 'up' if users_change >= 0 else 'down'
        },
        'orders': {
            'title': 'Orders',
            'value': f'{int(current_orders):,}',
            'change': round(orders_change, 1),
            'trend': 'up' if orders_change >= 0 else 'down'
        },
        'conversion': {
            'title': 'Conversion Rate',
            'value': f'{current_conversion:.1f}%',
            'change': round(conversion_change, 1),
            'trend': 'up' if conversion_change >= 0 else 'down'
        }
    }