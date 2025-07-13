from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import logging
import json

from .populate import initiate
from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review

# Logger
logger = logging.getLogger(__name__)

# 🚗 Get all cars
def get_cars(request):
    if CarMake.objects.count() == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = [{"CarModel": cm.name, "CarMake": cm.car_make.name} for cm in car_models]
    return JsonResponse({"CarModels": cars})

# 🔑 User login
@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    user = authenticate(username=data.get('userName'), password=data.get('password'))
    if user:
        login(request, user)
        return JsonResponse({"userName": user.username, "status": "Authenticated"})
    return JsonResponse({"userName": data.get('userName'), "status": "Failed"})

# 🔒 User logout
def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})

# 📝 User registration
@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data.get('userName')
    if User.objects.filter(username=username).exists():
        return JsonResponse({"userName": username, "error": "Already Registered"})
    user = User.objects.create_user(
        username=username,
        password=data.get('password'),
        first_name=data.get('firstName'),
        last_name=data.get('lastName'),
        email=data.get('email')
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})

# 📍 Get dealerships
def get_dealerships(request, state="All"):
    endpoint = f"/fetchDealers/{state}" if state != "All" else "/fetchDealers"
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})

# ⭐ Get dealer details
def get_dealer_details(request, dealer_id):
    endpoint = f"/fetchDealer/{dealer_id}"
    dealership = get_request(endpoint)
    # Sicherstellen, dass ein einzelnes Objekt zurückgegeben wird
    if isinstance(dealership, list) and dealership:
        dealership = dealership[0]
    return JsonResponse({"status": 200, "dealer": dealership})

# 💬 Get dealer reviews + sentiment
def get_dealer_reviews(request, dealer_id):
    endpoint = f"/fetchReviews/dealer/{dealer_id}"
    reviews = get_request(endpoint)
    for review in reviews:
        try:
            sentiment_response = analyze_review_sentiments(review['review'])
            review['sentiment'] = sentiment_response.get('sentiment', 'neutral')
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            review['sentiment'] = "neutral"
    return JsonResponse({"status": 200, "reviews": reviews})

# ➕ Add a review
@csrf_exempt
def add_review(request):
    if request.user.is_authenticated:
        try:
            data = json.loads(request.body)
            result = post_review(data)
            return JsonResponse({"status": 200, "result": result})
        except Exception as e:
            logger.error(f"Error posting review: {e}")
            return JsonResponse({"status": 500, "message": "Error posting review"})
    return JsonResponse({"status": 403, "message": "Unauthorized"})
