import React, {Component} from 'react'
import {Text, View, TouchableHighlight, Image} from 'react-native'
import MapView from 'react-native-maps'
import AutoComplete from '../AutoComplete/AutoComplete'
import List from '../List/List'
import BottomItemDetail from './BottomItemDetail'
import DropdownAlert from 'react-native-dropdownalert'
import {itemsRef} from '../../firebaseConfig'

class Map extends Component {
  state = {
    list: [],
    region: {
      latitude: this.props.navigation.state.params.region.latitude,
      longitude: this.props.navigation.state.params.region.longitude,
      latitudeDelta: this.props.navigation.state.params.region.latitudeDelta,
      longitudeDelta: this.props.navigation.state.params.region.longitudeDelta
    },
    currentLocationMarker: {
      latitude: this.props.navigation.state.params.region.latitude,
      longitude: this.props.navigation.state.params.region.longitude
    },
    showList: false,
    markerPress: -1,
    listOpenTime: 0
  }

  componentDidMount() {
    itemsRef.on('value', (snapshot) => {
      this.setState({loading: false});
      if (snapshot.val()) {
        this.setState({list: Object.values(snapshot.val())});
      }
    })
  }

  onRegionChange = (region) => {
    this.setState({region})
  }

  handleLongPress = (key) => {
    let {lat, lng} = this.state.list[key].location.geometry
    this.setState({
      region: {
        ...this.state.region, 
        latitude: lat,
        longitude: lng
      },
      currentLocationMarker: {
        latitude: lat,
        longitude: lng
      }
    })
  }
  generateUnexpendList = (key) => {
    //Just incase two style will be different, will change it back if there is no different
    let expandListButtonStyle = {
      flex: 1,
      backgroundColor: 'white',
      height: '40%',
      paddingHorizontal: 10,
    }
    let itemDetailStyle = {
      flex: 1,
      backgroundColor: 'white',
      height: '40%',
      paddingHorizontal: 10
    }
    return(
      this.state.markerPress === -1 
      ?
      <TouchableHighlight
        onPress={()=>{
          if(this.state.markerPress === -1){
            this.setState({
              showList: true,
              listOpenTime: ++this.state.listOpenTime
            })
            if(this.state.listOpenTime === 1) {
              this.dropdown.alertWithType('info', 'Tip', 'Long press to see item location');
            }
          }
        }}
        style={this.state.markerPress === -1 ? expandListButtonStyle: itemDetailStyle}
        underlayColor='#d6d7d8'
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 18, fontWeight: '900'}} >Expand list</Text>
        </View>
      </TouchableHighlight>
      : <BottomItemDetail navigate={this.props.navigation.navigate} detail={this.state.list[key]}/>
    )
  }
  render() {
    return (
      <View style={{flex: 1, width: '100%'}}>
        <MapView
          style={{height: this.state.showList ? '55%' : '88%'}}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChange}
          onPress={()=>{
            if(this.state.showList){
              this.setState({showList: !this.state.showList})
            } else {
              this.setState({markerPress: -1})
            }
          }}
        >
          {this.state.list.length ? this.state.list.map((marker, key) => (
            marker.location ? 
            <MapView.Marker
              key={key}
              coordinate={{
                latitude: marker.location.geometry.lat,
                longitude: marker.location.geometry.lng
              }}
              onPress={(e)=>{
                e.stopPropagation()
                this.setState({
                  markerPress: key,
                  showList: false})
              }}
            /> : null
          )) : null}
          <MapView.Marker
            coordinate={{
              latitude: this.state.currentLocationMarker.latitude,
              longitude: this.state.currentLocationMarker.longitude
            }}
            image={require('../../assets/images/currentLocation.png')}
          />
        </MapView>
        {this.state.showList ?
            <List list={this.state.list} navigate={this.props.navigation.navigate} handleLongPress={this.handleLongPress}/> 
            : this.generateUnexpendList(this.state.markerPress)
        }
        <DropdownAlert
          ref={ref => this.dropdown = ref }
          activeStatusBarStyle='default'
          closeInterval={3000}
          titleStyle={{marginTop: -15, color: 'white', fontWeight: '900'}}/>
      </View>
    );
  }
}

export default Map