var posts=["/food/3XUkCKaQGd4/","/food/JZutepq2GLM/","/food/o-0keAreHWM/","/food/XhEEo7trdv4/","/food/H4JqsHh3ThE/","/food/kriEiFcJXlc/","/food/L7UxEV6oL9M/","/food/gONExIBbazI/","/food/VnplcMkTkbE/"];function toRandomPost(){
    const target = posts[Math.floor(Math.random() * posts.length)] || "/";
    pjax.loadUrl(target);
  };