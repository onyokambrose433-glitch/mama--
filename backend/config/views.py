from django.http import HttpResponse, JsonResponse

def api_root_view(request):
    # If client accepts HTML (like a browser visiting http://127.0.0.1:8000)
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        html_content = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mama Shopping Center — Backend API Service</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background: #f8fafc;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 580px;
                    width: 90%;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    text-align: center;
                }
                .badge {
                    display: inline-block;
                    padding: 6px 14px;
                    background: #ecfdf5;
                    color: #059669;
                    font-size: 12px;
                    font-weight: 700;
                    border-radius: 999px;
                    margin-bottom: 16px;
                    border: 1px solid #a7f3d0;
                }
                .logo {
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    color: #0f172a;
                    margin-bottom: 6px;
                }
                .logo span {
                    color: #E15712;
                }
                .subtitle {
                    font-size: 13px;
                    color: #64748b;
                    margin-bottom: 28px;
                    line-height: 1.5;
                }
                .links-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 14px 18px;
                    border-radius: 14px;
                    font-size: 13px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }
                .btn-primary {
                    background: #E15712;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(225, 87, 18, 0.25);
                    grid-column: span 2;
                    font-size: 15px;
                }
                .btn-primary:hover {
                    background: #c4470a;
                }
                .btn-secondary {
                    background: #eff6ff;
                    color: #2FA0E1;
                    border: 1px solid #bfdbfe;
                }
                .btn-secondary:hover {
                    background: #dbeafe;
                }
                .btn-slate {
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                }
                .btn-slate:hover {
                    background: #e2e8f0;
                }
                .api-list {
                    text-align: left;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 16px;
                    font-size: 12px;
                }
                .api-list strong {
                    color: #334155;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .api-list a {
                    color: #2FA0E1;
                    text-decoration: none;
                    display: inline-block;
                    margin-right: 12px;
                    margin-bottom: 4px;
                    font-family: monospace;
                    font-weight: 600;
                }
                .api-list a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="badge">● Backend API Server Online</div>
                <div style="margin-bottom: 14px;">
                    <img src="/media/logo.png" alt="Mama Shopping Center" style="width: 80px; height: 80px; object-fit: contain; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
                </div>
                <div class="logo">MAMA <span>SHOPPING</span> CENTER</div>
                <div class="subtitle">
                    Django REST Framework backend for Mama Shopping Center.<br>
                    To view the supermarket website, open the React application:
                </div>

                <div class="links-grid">
                    <a href="http://localhost:5173/" class="btn btn-primary">
                        🛒 Open Supermarket Website (Port 5173) ➔
                    </a>
                    <a href="http://localhost:5173/admin-portal" class="btn btn-secondary">
                        🔐 Admin Portal
                    </a>
                    <a href="/django-admin/" class="btn btn-slate">
                        ⚙️ Django Admin
                    </a>
                </div>

                <div class="api-list">
                    <strong>Core REST Endpoints:</strong>
                    <div>
                        <a href="/api/products/">/api/products/</a>
                        <a href="/api/categories/">/api/categories/</a>
                        <a href="/api/delivery-zones/">/api/delivery-zones/</a>
                        <a href="/api/banners/">/api/banners/</a>
                        <a href="/api/settings/">/api/settings/</a>
                        <a href="/api/faqs/">/api/faqs/</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return HttpResponse(html_content)

    return JsonResponse({
        "supermarket": "Mama Shopping Center",
        "status": "online",
        "frontend_url": "http://localhost:5173",
        "admin_portal_url": "http://localhost:5173/admin-portal",
        "django_admin_url": "/django-admin/",
        "endpoints": {
            "products": "/api/products/",
            "categories": "/api/categories/",
            "delivery_zones": "/api/delivery-zones/",
            "settings": "/api/settings/",
            "banners": "/api/banners/",
            "cart": "/api/cart/",
            "orders": "/api/orders/",
        }
    })
