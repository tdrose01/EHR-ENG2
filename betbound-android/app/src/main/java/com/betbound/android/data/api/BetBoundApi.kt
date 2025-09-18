package com.betbound.android.data.api

import com.betbound.android.data.model.*
import retrofit2.http.GET
import retrofit2.http.Query

interface BetBoundApi {
    
    @GET("states")
    suspend fun getStates(): List<StateSummary>
    
    @GET("state/{code}")
    suspend fun getStateByCode(@Query("code") code: String): State
    
    @GET("state/by-geo")
    suspend fun getStateByGeo(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("state") state: String? = null
    ): State
    
    @GET("retail/nearby")
    suspend fun getNearbyRetail(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius_km") radiusKm: Double = 50.0,
        @Query("state") state: String? = null
    ): List<RetailLocation>
    
    @GET("legal/nearest")
    suspend fun getNearestLegal(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("state") state: String? = null
    ): NearestLegal
    
    @GET("operators")
    suspend fun getOperators(): OperatorCatalog
}

