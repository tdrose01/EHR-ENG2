package com.betbound.android.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class State(
    val state_code: String,
    val display_name: String,
    val status: LegalStatus,
    val age_minimum: Int,
    val notes: List<String>? = null,
    val regulator: Regulator,
    val operators: StateOperators,
    val retail_locations: List<RetailLocation> = emptyList(),
    val last_updated_utc: String
) : Parcelable

@Serializable
@Parcelize
data class LegalStatus(
    val online_sportsbook: Boolean,
    val retail: Boolean,
    val dfs: Boolean,
    val horse: Boolean
) : Parcelable

@Serializable
@Parcelize
data class Regulator(
    val name: String,
    val url: String
) : Parcelable

@Serializable
@Parcelize
data class StateOperators(
    val sportsbooks: List<String>,
    val dfs: List<String>,
    val horse: List<String>
) : Parcelable

@Serializable
@Parcelize
data class RetailLocation(
    val name: String,
    val lat: Double,
    val lng: Double,
    val hours: String? = null,
    val phone: String? = null,
    val url: String? = null,
    val distance_km: Double? = null
) : Parcelable

@Serializable
@Parcelize
data class StateSummary(
    val state_code: String,
    val display_name: String,
    val status: LegalStatus,
    val age_minimum: Int,
    val last_updated_utc: String
) : Parcelable
