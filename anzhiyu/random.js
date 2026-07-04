var posts=["/food/xgW3UWmoP34/","/food/kUJuvnvMCP4/","/food/3XUkCKaQGd4/","/food/h25L9yG4iSw/","/food/JZutepq2GLM/","/food/o-0keAreHWM/","/food/yQP10F7KR7A/","/food/XhEEo7trdv4/","/food/BmwL3enY1ZE/","/food/PDaG_Dlq_gA/","/food/mcR11PwsruE/","/food/H4JqsHh3ThE/","/food/B4m85yZjc7A/","/food/kriEiFcJXlc/","/food/L7UxEV6oL9M/","/food/gONExIBbazI/","/food/VnplcMkTkbE/","/food/t6fvIMzva68/","/food/t-gEVqs_Fg0/","/food/1XtUp46ISHY/","/food/SlpxKQsvafI/"];function toRandomPost(){
    const target = posts[Math.floor(Math.random() * posts.length)] || "/";
    pjax.loadUrl(target);
  };