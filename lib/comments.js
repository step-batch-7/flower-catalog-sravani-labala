const emojiSpace = 5;

class Comment {
  constructor(name, comment, time) {
    this.name = name;
    this.comment = comment;
    this.time = time;
  }
  toHTML() {
    let formattedComment = this.comment.replace(
      /\r\n/g,
      `</br>${'&nbsp'.repeat(emojiSpace)}`
    );
    const formattedName = this.name.replace(/ /g, ' &nbsp');
    formattedComment = formattedComment.replace(/ /g, '&nbsp');
    return `<div class="comment">
    <p >
    <strong>${'&#128100'}${formattedName}
    </strong>  ${this.time.toLocaleString()}<br/>
    ${'&#9997;'}${formattedComment}</p>
    </div>`;
  }
}

class Comments {
  constructor() {
    this.comments = [];
  }
  addComment(comment) {
    this.comments.unshift(comment);
  }
  toHTML() {
    return this.comments.map(comment => comment.toHTML()).join('');
  }
  static load(content) {
    const commentList = JSON.parse(content);
    const comments = new Comments();
    commentList.reverse().forEach(comment => {
      comments.addComment(
        new Comment(comment.name, comment.comment, new Date(comment.time))
      );
    });
    return comments;
  }
  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { Comment, Comments };
