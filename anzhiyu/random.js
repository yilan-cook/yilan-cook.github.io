var posts=["/food/3XUkCKaQGd4/","/food/h25L9yG4iSw/","/food/o-0keAreHWM/","/food/yQP10F7KR7A/","/food/BmwL3enY1ZE/","/food/PDaG_Dlq_gA/","/food/mcR11PwsruE/","/food/XhEEo7trdv4/","/food/H4JqsHh3ThE/","/food/B4m85yZjc7A/","/food/kriEiFcJXlc/","/food/VnplcMkTkbE/","/food/1XtUp46ISHY/","/food/gONExIBbazI/","/food/JZutepq2GLM/","/food/L7UxEV6oL9M/","/food/SlpxKQsvafI/"];function toRandomPost(){
    const target = posts[Math.floor(Math.random() * posts.length)] || "/";
    pjax.loadUrl(target);
  };