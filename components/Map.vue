<template>
  <div>
    <input
      id="place_input"
      type="text"
      placeholder="Please type to search address..."
    />
    <div id="map" style="height: 400px; width: 100%"></div>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  name: 'Map',
  // eslint-disable-next-line vue/require-prop-types
  props: ['latitude', 'longitude'],
  data() {
    return {
      map: null,
      marker: null,
      info: null,
      infoWindow: null,
    };
  },
  watch: {
    latitude: debounce(function (val) {
      if (val) {
        /* eslint-disable no-undef */
        this.map.setCenter(new google.maps.LatLng(val, this.longitude));
        this.map.panTo(new google.maps.LatLng(val, this.longitude));
        this.marker.setPosition(new google.maps.LatLng(val, this.longitude));
        this.infoWindow = new google.maps.InfoWindow({
          content: `<p>Latitude: ${this.latitude}</p><p>Longitude: ${this.longitude}</p>`,
        });
      }
    }, 500),
    longitude: debounce(function (val) {
      if (val) {
        /* eslint-disable no-undef */
        this.map.setCenter(new google.maps.LatLng(this.latitude, val));
        this.map.panTo(new google.maps.LatLng(this.latitude, val));
        this.marker.setPosition(new google.maps.LatLng(this.latitude, val));
        this.infoWindow = new google.maps.InfoWindow({
          content: `<p>Latitude: ${this.latitude}</p><p>Longitude: ${this.longitude}</p>`,
        });
      }
    }, 500),
  },
  mounted() {
    /* eslint-disable no-undef */
    const vm = this;
    const position = {
      lat: this.latitude,
      lng: this.longitude,
    };

    // initiate map
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: position,
      zoom: 13,
      mapTypeId: 'roadmap',
    });

    // set marker
    this.marker = new google.maps.Marker({
      position,
      map: this.map,
      draggable: true,
    });

    // info window
    this.infoWindow = new google.maps.InfoWindow({
      content: `<p>Latitude: ${this.latitude}</p><p>Longitude: ${this.longitude}</p>`,
    });

    // add click event into marker
    this.marker.addListener('click', function (event) {
      vm.infoWindow.open(vm.map, vm.marker);
    });
    // add dragend event into marker
    this.marker.addListener('dragend', function (event) {
      // fire location change event
      const location = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };
      vm.$emit('location-changed', location);
    });
    // add click event into map and move marker
    this.map.addListener('click', function (event) {
      vm.marker.setPosition(event.latLng);
      vm.infoWindow = new google.maps.InfoWindow({
        content: `<p>Latitude: ${event.latLng.lat()}</p><p>Longitude: ${event.latLng.lng()}</p>`,
      });
      // fire location change event
      const location = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };
      vm.$emit('location-changed', location);
    });

    // Create the search box and link it to the UI element.
    const input = document.getElementById('place_input');
    const searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    this.map.addListener('bounds_changed', function () {
      searchBox.setBounds(vm.map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
      const places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      places.forEach(function (place) {
        if (!place.geometry) {
          console.log('Returned place contains no geometry');
          return;
        }
        // Create a marker for place.
        vm.marker.setPosition(place.geometry.location);
        vm.infoWindow = new google.maps.InfoWindow({
          content: `<p>Latitude: ${place.geometry.location.lat()}</p><p>Longitude: ${place.geometry.location.lng()}</p>`,
        });

        // fire location change event
        const location = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        };
        vm.$emit('location-changed', location);

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      vm.map.fitBounds(bounds);
    });
  },
};
</script>

<style scoped>
#place_input {
  line-height: 20px;
  font-size: 18px;
  background-color: #fff;
  color: #000;
  margin-left: 12px;
  padding: 5px 10px;
  text-overflow: ellipsis;
  width: 400px;
  border: 2px solid #5e35b1;
}
#place_input:focus {
  border-color: #006747;
}
</style>
