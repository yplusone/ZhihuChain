import React from "react";
import logo from "./logo.png";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Card, Navbar, Nav, FormControl, Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import Web3 from "web3";
import { HashRouter, Switch, Route, Link } from 'react-router-dom';
import { IoIosAdd } from 'react-icons/io';
// import { ModalProvider } from 'react-use-modal';
// import ReactBootstrapModal from './Modal.js';
// import { useModal } from 'react-use-modal';
// import DeleteBusiness from "modal.js"
export const CONTRACT = "0xD2FF25f8F070A2e9Bd0Eb7B8db021FbBA4889190";
export let web3 = window.web3;

class App extends React.Component {
  state = {
    loading: false,
    proposal: "",
    num_question: "",
    questions: []
  };
  constructor() {
    super();
  };

  render() {
    return (
      <div>
        <HashRouter>
          <Navbar bg="dark" variant="dark" class="mynav">
            <Navbar.Brand href="/">知乎链</Navbar.Brand>
            <Nav className="mr-auto">
            </Nav>
            <Button variant="outline-info" ><Link to="/raise" class="link"><IoIosAdd/></Link></Button>
          </Navbar>

          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/raise" component={Raise} />
            <Route path="/about/:id" component={About} />
          </Switch>
        </HashRouter>
      </div>
    );
  }
}
class Home extends React.Component {
  state = {
    loading: false,
    proposal: "",
    num_question: "",
    questions: []
  };
  constructor() {
    super();
  };
  getQuestions = async () => {
    let questions = [];
    await this.getQuestionNum();
    let question_num = this.state.num_question;
    for (let i = 0; i < question_num; i++) {
      const payload = web3.eth.abi.encodeFunctionCall(
        {
          name: "getQuest",
          type: "function",
          inputs: [{
            type: 'uint256',
            name: 'questInt'
          }]
        },
        [i]
      );

      const res = await web3.eth.call({
        to: CONTRACT,
        data: payload
      });
      questions.push(web3.eth.abi.decodeParameters([{
        type: 'uint256',
        name: 'id'
      }, {
        type: 'string',
        name: 'question'
      }, {
        type: 'address[]',
        name: 'answers'
      }, {
        type: 'bool',
        name: 'userifanswer'
      }], res));
    }
    this.setState({
      questions: questions
    });
  }
  getQuestionNum = async () => {
    const payload = web3.eth.abi.encodeFunctionCall(
      {
        name: "getNumQuests",
        type: "function",
        inputs: []
      },
      []
    );

    const res = await web3.eth.call({
      to: CONTRACT,
      data: payload
    });
    this.setState({
      num_question: web3.eth.abi.decodeParameter("uint8", res)
    });
  };
  componentWillMount() {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        console.log("init metamask", window.ethereum);
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        web3.eth.getAccounts(function (err, accounts) {
          web3.eth.defaultAccount = accounts[0];
          console.log(accounts[0])
        });
      } else {
        console.log("inject sdk");
        web3 = new Web3(
          new Web3.providers.HttpProvider("http://localhost:7545")
        );
        // 添加Ganache第一个账户的私钥
        web3.eth.accounts.wallet.add(
          "3660ca159717f9cf68ac2450985f79c1a7cce3ecaa453ded97ecc0fb97d0b4a1"
        );

        web3.eth.defaultAccount = "0x1292b879380A43EC3f30dA6F030246E63570f049";
      }
      await this.getQuestions();
    });
  }
  gotosome = (item) => {
    this.props.history.push({
      pathname: '/about/' + item.id
    });
    window.location.reload();

  }
  render() {
    return (
      <div className="cards">
        {this.state.questions.map((quest) => {
          return (
            <Card className="my-card" style={{ width: '22rem' }} onClick={() => this.gotosome(quest)}>
              <Card.Header>问题编号：{quest.id}</Card.Header>
              <Card.Body>
                <Card.Text>
                  {quest.question}
                </Card.Text>
                {/* <Button variant="secondary" id="rightbutton" onClick={() => this.gotosome(quest)}>查看详情</Button> */}
              </Card.Body>
              <Card.Footer className="text-muted">获得回答数：{quest.answers.length-1}</Card.Footer>
            </Card>
          )

        })}

      </div>
    )
  }
}
class Raise extends React.Component {
  state = {
    loading: false,
    proposal: "",
    num_question: "",
    question: '',
    addition:null,
    id:null
  };
  constructor(props) {
    super(props);
  };
  getQuestionNum = async () => {
    const payload = web3.eth.abi.encodeFunctionCall(
      {
        name: "getNumQuests",
        type: "function",
        inputs: []
      },
      []
    );

    const res = await web3.eth.call({
      to: CONTRACT,
      data: payload
    });
    this.setState({
      id: web3.eth.abi.decodeParameter("uint8", res)
    });
  };
  ask = async () => {
    const funcSig = web3.eth.abi.encodeFunctionSignature("addPost(string)");
    const param = web3.eth.abi.encodeParameter("string", this.state.question);
    this.setState({
      loading: true
    });

    try {
      await web3.eth.sendTransaction({
        to: CONTRACT, // contract address
        data: funcSig + param.slice(2),
        gas: 2000000
      }).then(res => {
        console.log(res)
      });
      alert("add question success");
      await this.getQuestionNum();
      await this.answerquest(this.state.id-1)
    } catch (e) {
      alert(e.message);
    } finally {
      this.setState({
        loading: false
      });
    }
  };
  answerquest = async (id) => {
    const funcSig = web3.eth.abi.encodeFunctionSignature("answer(uint256,string)");
    const param = web3.eth.abi.encodeParameters(['uint256', 'string'], [id, this.state.addition]);
    this.setState({
      loading: true
    });
    try {
      await web3.eth.sendTransaction({
        to: CONTRACT, // contract address
        data: funcSig + param.slice(2),
        gas: 2000000
      }).then(res => {
        console.log(res)
      });
    } catch (e) {
      alert(e.message);
    } finally {
      this.setState({
        loading: false
      });
    }

  }
  componentWillMount() {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        console.log("init metamask", window.ethereum);
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        web3.eth.getAccounts(function (err, accounts) {
          web3.eth.defaultAccount = accounts[0];
        });
      } else {
        console.log("inject sdk");
        web3 = new Web3(
          new Web3.providers.HttpProvider("http://localhost:7545")
        );
        // 添加Ganache第一个账户的私钥
        web3.eth.accounts.wallet.add(
          "3660ca159717f9cf68ac2450985f79c1a7cce3ecaa453ded97ecc0fb97d0b4a1"
        );

        web3.eth.defaultAccount = "0x1292b879380A43EC3f30dA6F030246E63570f049";
      }
    });
  }
  pushquestion = e => {
    this.setState({
      question: e.target.value
    });
  };
  pushaddition = e => {
    this.setState({
      addition: e.target.value
    });
  };
  render() {
    return (
      <div>
        <br/>
        <Card className="text-center">
          <Card.Header>问题</Card.Header>
          <Card.Body>
            <Card.Text>
              <Form.Control type="text" placeholder="提问" onChange={this.pushquestion}/>
              <br />
              <Form.Group controlId="exampleForm.ControlTextarea1">
                <Form.Control placeholder="问题补充" as="textarea" rows="3" onChange={this.pushaddition}/>
              </Form.Group>
            </Card.Text>
            <Button variant="secondary" onClick={this.ask}>我要提问</Button>
          </Card.Body>
        </Card>
      </div>
    )
  }
}
class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      quest_content: null,
      show: null,
      ans_content: null,
      answerers: [],
      anses: [],
      addtion:null,
      author:null
    };
  }
  componentWillMount() {
    this.setState({
      id: this.props.match.params.id
    });
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        console.log("init metamask", window.ethereum);
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        web3.eth.getAccounts(function (err, accounts) {
          web3.eth.defaultAccount = accounts[0];
        });
      } else {
        console.log("inject sdk");
        web3 = new Web3(
          new Web3.providers.HttpProvider("http://localhost:7545")
        );
        // 添加Ganache第一个账户的私钥
        web3.eth.accounts.wallet.add(
          "3660ca159717f9cf68ac2450985f79c1a7cce3ecaa453ded97ecc0fb97d0b4a1"
        );

        web3.eth.defaultAccount = "0x1292b879380A43EC3f30dA6F030246E63570f049";
      }
      await this.getQuestion(this.state.id)
      await this.getAnswers()
    })
  }
  getQuestion = async (id) => {
    const payload = web3.eth.abi.encodeFunctionCall(
      {
        name: "getQuest",
        type: "function",
        inputs: [{
          type: 'uint256',
          name: 'questInt'
        }]
      },
      [id]
    );

    const res = await web3.eth.call({
      to: CONTRACT,
      data: payload
    });
    let quest = web3.eth.abi.decodeParameters([{
      type: 'uint256',
      name: 'id'
    }, {
      type: 'string',
      name: 'question'
    }, {
      type: 'address[]',
      name: 'answers'
    }, {
      type: 'bool',
      name: 'userifanswer'
    }], res);
    console.log(quest)
    this.setState({
      quest_content: quest.question,
      answerers: quest.answers
    });
  };

  getAnswers = async () => {
    let id = this.state.id;
    for (let m = 0; m < this.state.answerers.length; m++) {
      await this.getAnswer(id, this.state.answerers[m])
    }
    if(this.state.anses.length!=0){
      this.setState({
        addition:this.state.anses[0].ans,
        author:this.state.anses[0].user
      })
      var ans_temp = this.state.anses;
      ans_temp.splice(0,1)
      this.setState({
        anses: ans_temp
      })
    }
  }
  getAnswer = async (id, add) => {
    const payload = web3.eth.abi.encodeFunctionCall(
      {
        name: "getAnswer",
        type: "function",
        inputs: [{
          type: 'uint256',
          name: 'questInt'
        }, {
          type: 'address',
          name: 'some_user'
        }]
      },
      [id, add]
    );

    const res = await web3.eth.call({
      to: CONTRACT,
      data: payload
    });
    let ans = web3.eth.abi.decodeParameters([{
      type: 'string',
      name: 'some_ans'
    }], res);
    let user_ans = {
      user: add,
      ans: ans.some_ans
    }
    var anses = this.state.anses;
    anses.push(user_ans)
    this.setState({
      anses: anses
    })
  };
  answer = () => {
    var show = !this.state.show
    this.setState({
      show: show
    });
  }
  answerquest = async () => {
    const funcSig = web3.eth.abi.encodeFunctionSignature("answer(uint256,string)");
    const param = web3.eth.abi.encodeParameters(['uint256', 'string'], [this.state.id, this.state.ans_content]);
    this.setState({
      loading: true
    });
    try {
      await web3.eth.sendTransaction({
        to: CONTRACT, // contract address
        data: funcSig + param.slice(2),
        gas: 2000000
      }).then(res => {
        console.log(res)
      });
      alert("add answer success");
    } catch (e) {
      alert(e.message);
    } finally {
      this.setState({
        loading: false
      });
    }


    this.setState({
      show: false
    });
    await this.getAnswers()
    window.location.reload();
  }
  pushanswer = e => {
    this.setState({
      ans_content: e.target.value
    });
  };
  render() {
    return (
      <div>
        <br/>
        <Card className="text-center" >
          <Card.Header>问题</Card.Header>
          <Card.Body>
            <Card.Title>{this.state.quest_content}</Card.Title>
            <Card.Text>
              {this.state.addition}
      </Card.Text>
            <Button variant="secondary" onClick={this.answer}>我要回答</Button>
          </Card.Body>
          <Card.Footer className="text-muted">From:{this.state.author}</Card.Footer>
        </Card>
        {this.state.show && (
          < Card className="text-center">
            <Card.Body>
              <Card.Text>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>回答</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl as="textarea" aria-label="With textarea" onChange={this.pushanswer} />
                </InputGroup>
              </Card.Text>
              <Button variant="secondary" onClick={this.answerquest}>添加回答</Button>
            </Card.Body>

          </Card >)
        }
        {this.state.anses.map((ans) => {
          return (
          <div>
            <br/>
          < Card >
            <Card.Body>{ans.ans}</Card.Body>
            <Card.Footer className="text-muted">From:{ans.user}</Card.Footer>
          </Card >
          </div>)
        })}

      </div>
    )
  }

}

export default App;
