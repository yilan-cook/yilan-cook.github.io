var posts=["/food/3XUkCKaQGd4/","/food/JZutepq2GLM/","/food/XhEEo7trdv4/","/food/BmwL3enY1ZE/","/food/PDaG_Dlq_gA/","/food/H4JqsHh3ThE/","/food/L7UxEV6oL9M/","/food/gONExIBbazI/","/food/VnplcMkTkbE/","/food/o-0keAreHWM/","/food/kriEiFcJXlc/","/food/SlpxKQsvafI/"];function toRandomPost(){
    const target = posts[Math.floor(Math.random() * posts.length)] || "/";
    pjax.loadUrl(target);
  };