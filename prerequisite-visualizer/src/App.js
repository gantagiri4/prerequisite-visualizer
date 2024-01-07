import './App.css';
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import ReactSearchBox from "react-search-box";
import 'react-tree-graph/dist/style.css'
import ReactECharts from 'echarts-for-react';


//var mysql = require('mysql2'); //error here

const headerStyle = {
  backgroundColor: '#630031',
  color: 'white',
  padding: '15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Tahoma, sans-serif',
  height: '115px',
  position: 'relative' // This line is needed to position the button absolutely within this container
};

const titleStyle = {
  textAlign: 'center',
};

const loginstyle = {
  backgroundColor: '#630031',
  color: 'white',
  border: 'none',
  fontSize: '28px',
  position: 'absolute', // This line positions the button absolutely
  right: '35px', // This line moves the button to the right
  top: '50%', // This line moves the button to the middle vertically
  transform: 'translateY(-50%)' // This line adjusts the button's position to its center
};

const footerStyle = {
  backgroundColor: '#630031',
  color: 'white',
  padding: '1px',
  textAlign: 'center',
  position: 'relative',
  width: '100%',
  height: 'auto',
  bottom: '0',
  left: '0',
  right: '0',
  height: '115px'
};

const imageStyle = {
  width: '130px',
  height: 'auto',
};

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#EEEDED',

};

function getDependencyMap(data) {
  let p = data.filter(d => {
    return d['prereqs'];
  });

  let aMap = {};
  p.forEach(d => {
    let id = d['id'];
    let isRequired = d['prereqs'].includes("*");
    let prereqsSubString;
    if (isRequired) {
      prereqsSubString = d['prereqs'].replace("*", "");
    } else {
      prereqsSubString = d['prereqs'];
    }
    let arr = prereqsSubString.split(";");
    aMap[id] = {
      'label': d['name'].split("-")[0].trim(),
      'child': arr,
      'isRequired': isRequired
    };
  });

  return aMap;
}


function Header() {
  const [visible, setVisible] = useState(false)

  function toggleLogin() {
    setVisible(!visible);
  };

  return (
    <header style={headerStyle}>
      <div style={titleStyle}>
        <h1>Virginia Tech CS Course Visualizer</h1>
      </div>
      {/* <a href="https://login.cs.vt.edu/cas/login">
        <button style={loginstyle} className="nav-item">Login</button>
      </a> */}

      {/* <button style={loginstyle} onClick={toggleLogin} className="nav-item">Login</button>
      {visible ? <Login toggle={toggleLogin} visibility={visible} /> : null} */}

    </header>
  );
}

function construct(id, label, formattedData, dMap, data) {

  if (dMap[id]) {
    let d = {
      "id": id,
      "name": dMap[id]['label'],
      "textProps": { x: -33, y: 25 },
      "children": []
    };
    dMap[id]['child'].forEach(c => {
      let childData = construct(c, getLabel(c, data), formattedData, dMap, data);
      if (dMap[id]['isRequired'] === true) {
        let name = childData['name'] + "*";
        childData['name'] = name;
      }
      d.children.push(childData);
    })
    formattedData[id] = d;
  } else {
    formattedData[id] = {
      "id": id,
      "name": label,
      "textProps": { x: -33, y: 25 },
      "children": []
    };
  }
  return formattedData[id];
}

function getLabel(c, data) {
  return data.filter(d => d['id'] == c)[0]['name'].split('-')[0].trim();
}

function getTreeData(formattedData) {
  let child = [];
  Object.keys(formattedData).forEach(function (key) {
    child.push(formattedData[key]);
  });
  return {
    "name": 'Courses',
    "children": child
  };
}

function CourseContainer({ setTreeData }) {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [formatData, setFormatData] = useState({});

  useEffect(() => {
    fetch('https://prereq-visualizer-backend.discovery.cs.vt.edu/courses')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        setData(data);
        let dMap = getDependencyMap(data);
        let formattedData = {};
        data.forEach(d => {
          construct(d['id'], d['name'].split("-")[0].trim(), formattedData, dMap, data);
        });
        let treeData = getTreeData(formattedData);
        setFormatData(formattedData);
        setTreeData(treeData);
        console.log(formattedData);
        console.log(treeData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const transformedCourses = data.map(course => {
    const courseCode = course.name.split(" - ")[0];
    return {
      key: course.id.toString(),
      value: courseCode
    };
  });

  return (
    <div className="text-black full-height left-align p-3 col-md-5" style={{ backgroundColor: '#75787b', 'borderRadius': '10px', overflow: 'auto', marginLeft: '-250px', width: '200px' }}>
      <ReactSearchBox
        placeholder="Search CS Course"
        value={searchValue}
        data={transformedCourses}
        onChange={value => setSearchValue(value)}
        callback={record => console.log(record)}
        onSelect={record => {
          console.log(formatData[record.item.key]);
          setTreeData(formatData[record.item.key]);
        }}
      />
    </div>
  );
}

function TreeContainer({ treeDataFromParent }) {
  const option = {
    "series": [
      {
        "type": 'tree',
        // "orient": 'vertical',
        "data": [treeDataFromParent],
        "top": '1%',
        "left": '7%',
        "bottom": '1%',
        "right": '20%',
        "symbol": 'circle', //or case is diamond
        "symbolSize": 12,
        "label": {
          "position": 'left',
          "verticalAlign": 'middle',
          "align": 'right',
          "fontSize": 16
        },

        "leaves": {
          "label": {
            "position": 'right',
            "verticalAlign": 'middle',
            "align": 'left'
          }
        },

        "emphasis": {
          "focus": 'descendant'
        },

        "expandAndCollapse": true,
        "initialTreeDepth": 0,
        "animationDuration": 550,
        "animationDurationUpdate": 750
      }
    ]
  };
  const opt = {
    "width": "1000px",
    "height": "1000px"
  };
  return (
    <div className="text-white full-height p-3 d-flex flex-column justify-content-center align-items-left"
      style={{
        backgroundColor: '#861F41',
        borderRadius: '10px',
        height: '1000px',
        width: '1200px',
        marginLeft: '-550px',
        overflow: 'scroll' // This line adds a scrollbar if the content overflows
      }}>
      <ReactECharts option={option} opt={opt} style={{ height: '100%', width: '100%' }} />
      {/* <AnimatedTree
        data={treeDataFromParent}
        height={1080}
        width={1920} 
        labelProp="label" /> */}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ position: 'absolute', marginLeft: '100px', marginTop: '0px'}}>
      <div
        className="text-white p-3 d-flex flex-column justify-content-start align-items-top"
        style={{
          borderRadius: '10px',
          height: '400px',
          width: '200px',
          display: 'inline-block',
          background: '#75787b',
          textAlign: 'center'
        }}
      >
        <h2 style={{margin: '0'}}>
          Legend:
        </h2>
        <p style={{marginTop: '20px'}}>
          * = Choose one of these courses
        </p>
      </div>
    </div>
  );
}



function Body() {
  const [treeData, setTreeData] = useState([]);

  return (
    <main className="container flex-grow-1">
      <div className="row justify-content-between" style={{}}>

        <div className="col-md-4" style={{ textAlign: "left" }}>
          <div className="p-4">
            <CourseContainer setTreeData={setTreeData} />
          </div>
        </div>

        <div className="col-md-4" style={{ textAlign: "left" }}>
          <div className="p-4">
            <TreeContainer treeDataFromParent={treeData} />
          </div>
        </div>

        <div className="col-md-1" style={{ textAlign: "left" }}>
          <div className="p-4">
            <Legend />
          </div>
        </div>


      </div>
    </main>
  );
}




function Footer() {
  return (
    // <footer className="bg-dark text-white p-3 mt-auto">
    <footer style={footerStyle}>
      <img src="https://1000logos.net/wp-content/uploads/2018/10/Virginia-Tech-Logo.png" alt="Footer Image" style={imageStyle} />
      <p style={{ fontSize: '1em' }}>&copy; 2023 Virginia Polytechnic Institute and State University </p>
    </footer>
  );
}

function Login(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    // Code to handle login goes here

    props.toggle()
  }

  return (
    <div className="popup">
      <div className="popup-inner">
        {/* <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Username:
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button type="submit">Login</button>
          <button className="cancel-button" onClick={props.toggle}>Cancel</button>
        </form> */}
        {/* <button className="cancel-button"onClick={props.toggle}>Cancel</button> */}
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="d-flex flex-column" style={appStyle}>
      <Header />
      <Body className="flex-grow-1" />
      <Footer />
    </div>
  );
}


export default App;