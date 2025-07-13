from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('djangoapp/', include('djangoapp.urls')),  # API-Endpoints
    path('login/', TemplateView.as_view(template_name="index.html")),
    path('register/', TemplateView.as_view(template_name="index.html")),
    path('dealers/', TemplateView.as_view(template_name="index.html")),
    path('dealer/<int:dealer_id>/', TemplateView.as_view(template_name="index.html")),
    path('postreview/<int:dealer_id>/', TemplateView.as_view(template_name="index.html")),  # 👈 Wichtig!
    path('', TemplateView.as_view(template_name="Home.html")),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all für React Router
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name="index.html")),
]
