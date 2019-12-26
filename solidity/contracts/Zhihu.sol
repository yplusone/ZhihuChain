pragma solidity ^0.5.0;


contract Zhihu {

    // 问题结构
    struct Question {
        string title;     // 题目
        mapping (address => loginUser) loginUsers;   // 用户列表
        address[] loginUsersAddress;   // 所有参与评价者的地址
    }
    // user结构
    struct loginUser {
        string answer;
        bool answered; // 是否评论过
    }

    Question[] public questions;  // 留言数组

    event CreatedQuestionEvent();   // 创建新留言的事件
    event CreatedAnswerEvent();  // 评论事件

    // 获取当前问题个数
    function getNumQuests() public view returns (uint) {
        return questions.length;
    }
    // 获取留言详细信息
    function getQuest(uint questInt) public view returns (uint, string memory, address[] memory, bool) {
        if (questions.length > 0) {
            Question storage p = questions[questInt]; // Get the post
            // 返回的数据包括: 序号，问题内容，留言互动参与者列表，当前用户评论了没有
            return (questInt, p.title, p.loginUsersAddress, p.loginUsers[msg.sender].answered);
        }
    }
    //获取回答详细信息
    function getAnswer(uint questInt,address some_user) public view returns (string memory) {
        if (questions.length > 0) {
            Question storage p = questions[questInt]; // Get the post
            return(p.loginUsers[some_user].answer);
        }
    } 
    // 添加问题
    function addPost(string memory title) public returns (bool) {
        Question memory quest;
        emit CreatedQuestionEvent(); //触发事件
        quest.title = title; // 内容
        questions.push(quest);  // 压入数组
        return true;
    }
    // 添加回答
    function answer(uint questInt, string memory ans) public returns (bool) {
        if (questions[questInt].loginUsers[msg.sender].answered == false) { // 只有没回答过的才允许回答
            Question storage p = questions[questInt];
            p.loginUsers[msg.sender].answer = ans;
            p.loginUsers[msg.sender].answered = true;   // 评论过的flag置为true
            p.loginUsersAddress.push(msg.sender); // 当前用户作为参与者压入栈中
            emit CreatedAnswerEvent(); //触发事件
            return true;
        } else {
            return false;
        }
    }

}
