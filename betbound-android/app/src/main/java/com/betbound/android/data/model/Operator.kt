package com.betbound.android.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Operator(
    val name: String,
    val android_uri: String,
    val android_package: String? = null,
    val web_fallback: String,
    val icon_url: String? = null,
    val description: String? = null
) : Parcelable

@Serializable
@Parcelize
data class OperatorCatalog(
    val operators: List<Operator>,
    val dfs: List<Operator>,
    val horse: List<Operator>,
    val last_updated_utc: String
) : Parcelable

@Serializable
@Parcelize
data class NearestLegal(
    val target_state_code: String,
    val distance_km: Double,
    val nearest_point_lat: Double,
    val nearest_point_lng: Double,
    val target_state_name: String? = null,
    val nearest_city: String? = null,
    val estimated_drive_time_minutes: Int? = null,
    val route_summary: String? = null,
    val last_updated_utc: String
) : Parcelable

