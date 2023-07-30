import { Component } from "react";
import "./app.scss";
// import "taro-ui/dist/style/components/icon.scss";
// import "./custom-variables.scss";

class App extends Component {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  // this.props.children 是将要会渲染的页面

  render() {
    return this.props.children;
  }
}

export default App;
