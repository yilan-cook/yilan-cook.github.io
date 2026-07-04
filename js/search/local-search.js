window.addEventListener("load", () => {
  let loadFlag = false;
  let dataObj = Promise.resolve([]);
  let searchTimer = null;
  const $searchMask = document.getElementById("search-mask");

  const showSearchWrap = () => {
    const $searchWrap = document.querySelector("#local-search .search-wrap");
    if ($searchWrap) $searchWrap.style.display = "block";
  };

  const showSearchError = message => {
    showSearchWrap();
    const $loadingStatus = document.getElementById("loading-status");
    const $resultContent = document.getElementById("local-search-results");
    if ($loadingStatus) $loadingStatus.innerHTML = "";
    if ($resultContent) {
      $resultContent.style.display = "block";
      $resultContent.innerHTML = `<div id="local-search__hits-empty">${message}</div>`;
    }
  };

  const openSearch = () => {
    const bodyStyle = document.body.style;
    bodyStyle.width = "100%";
    bodyStyle.overflow = "hidden";
    anzhiyu.animateIn($searchMask, "to_show 0.5s");
    anzhiyu.animateIn(document.querySelector("#local-search .search-dialog"), "titleScale 0.5s");
    setTimeout(() => {
      document.querySelector("#local-search-input input").focus();
    }, 100);
    if (!loadFlag) {
      search();
      loadFlag = true;
    }
    // shortcut: ESC
    document.addEventListener("keydown", function f(event) {
      if (event.code === "Escape") {
        closeSearch();
        document.removeEventListener("keydown", f);
      }
    });
  };

  const closeSearch = () => {
    const bodyStyle = document.body.style;
    bodyStyle.width = "";
    bodyStyle.overflow = "";
    anzhiyu.animateOut(document.querySelector("#local-search .search-dialog"), "search_close .5s");
    anzhiyu.animateOut($searchMask, "to_hide 0.5s");
  };

  const searchClickFn = () => {
    document.querySelector("#search-button > .search").addEventListener("click", openSearch);
    document.querySelector("#menu-search").addEventListener("click", openSearch);
  };

  const searchClickFnOnce = () => {
    document.querySelector("#local-search .search-close-button").addEventListener("click", closeSearch);
    $searchMask.addEventListener("click", closeSearch);
    if (GLOBAL_CONFIG.localSearch.preload) {
      dataObj = fetchData(GLOBAL_CONFIG.localSearch.path).catch(error => {
        console.error("Local search index loading failed:", error);
        showSearchError("搜索索引加载失败，请刷新页面后重试");
        return [];
      });
    }
  };

  // check url is json or not
  const isJson = url => {
    const reg = /\.json$/;
    return reg.test(url);
  };

  const fetchData = async path => {
    let data = [];
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
    if (isJson(path)) {
      data = await response.json();
    } else {
      const res = await response.text();
      const t = await new window.DOMParser().parseFromString(res, "text/xml");
      const parseError = t.querySelector("parsererror");
      if (parseError) throw new Error(parseError.textContent || "Search index XML parse failed");
      const a = await t;

      const normalizeSearchUrl = url => {
        if (!url) return "/";
        let normalized = decodeURI(url).trim();
        if (/^https?:\/\//i.test(normalized)) {
          try {
            const parsed = new URL(normalized);
            return `${parsed.pathname}${parsed.search}${parsed.hash}`;
          } catch (error) {
            return normalized;
          }
        }
        normalized = normalized.replace(/^\/+/, "");
        return `${GLOBAL_CONFIG.root || "/"}${normalized}`.replace(/\/{2,}/g, "/");
      };

      const shouldUseSearchImage = src => {
        if (!src) return false;
        return !/ytimg\.com|youtube\.com|favicon|avatar|data:image|blob:/i.test(src);
      };

      const escapeHtml = value =>
        String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const escapeAttr = value =>
        String(value || "")
          .replace(/<[^>]*>/g, "")
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      data = [...a.querySelectorAll("entry")].map(item => {
        let tagsArr = [];
        if (item.querySelector("tags") && item.querySelector("tags").getElementsByTagName("tag")) {
          Array.prototype.forEach.call(item.querySelector("tags").getElementsByTagName("tag"), function (item, index) {
            tagsArr.push(item.textContent);
          });
        }
        let content = (item.querySelector("content") && item.querySelector("content").textContent) || "";
        const cover = item.querySelector("cover") && item.querySelector("cover").textContent;
        let imgReg = /<img.*?(?:>|\/>)/gi; //匹配图片中的img标签
        let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i; // 匹配图片中的src
        let arr = content.match(imgReg); //筛选出所有的img

        let srcArr = [];
        if (arr) {
          for (let i = 0; i < arr.length; i++) {
            let src = arr[i].match(srcReg);
            // 获取图片地址
            if (src && src[1] && (/^(https?:)?\/\//i.test(src[1]) || src[1].startsWith("/")) && shouldUseSearchImage(src[1])) srcArr.push(src[1]);
          }
        }

        return {
          title: item.querySelector("title") ? item.querySelector("title").textContent : "",
          content: content,
          url: normalizeSearchUrl(item.querySelector("url") ? item.querySelector("url").textContent : "/"),
          tags: tagsArr,
          oneImage: shouldUseSearchImage(cover) ? cover : (srcArr && srcArr[0]),
        };
      });
    }
    if (response.ok) {
      const $loadDataItem = document.getElementById("loading-database");
      if ($loadDataItem) {
        $loadDataItem.nextElementSibling.style.display = "block";
        $loadDataItem.remove();
      } else {
        showSearchWrap();
      }
    }
    return data;
  };

  const search = () => {
    if (!GLOBAL_CONFIG.localSearch.preload) {
      dataObj = fetchData(GLOBAL_CONFIG.localSearch.path).catch(error => {
        console.error("Local search index loading failed:", error);
        showSearchError("搜索索引加载失败，请刷新页面后重试");
        return [];
      });
    }
    const $input = document.querySelector("#local-search-input input");
    const $resultContent = document.getElementById("local-search-results");
    const $loadingStatus = document.getElementById("loading-status");

    const escapeHtml = value =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const escapeAttr = value =>
      String(value || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const escapeRegExp = value => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const highlightText = (text, keywords) => {
      let result = escapeHtml(text);
      keywords.forEach(keyword => {
        if (!keyword) return;
        result = result.replace(new RegExp(escapeRegExp(keyword), "gi"), match => {
          return `<span class="search-keyword">${match}</span>`;
        });
      });
      return result;
    };

    $input.addEventListener("input", function () {
      const searchText = this.value.trim();
      const keywords = searchText.toLowerCase().split(/[\s]+/).filter(Boolean);
      clearTimeout(searchTimer);
      $resultContent.innerHTML = "";
      $resultContent.style.display = "block";

      if (keywords.length === 0) {
        $loadingStatus.innerHTML = "";
        return;
      }

      $loadingStatus.innerHTML = '<i class="anzhiyufont anzhiyu-icon-spinner anzhiyu-pulse-icon"></i>';

      searchTimer = setTimeout(() => {
        let str = '<div class="search-result-list">';
        let count = 0;

        dataObj.then(data => {
        data.forEach(data => {
          let isMatch = true;
          const rawTitle = data.title ? data.title.trim() : "";
          const dataTitle = rawTitle.toLowerCase();
          let dataTags = data.tags;
          let oneImage = data.oneImage ?? "";
          const rawContent = data.content
            ? data.content
                .trim()
                .replace(/<[^>]+>/g, "")
            : "";
          const dataContent = rawContent.toLowerCase();
          const dataUrl = data.url;
          const safeDataUrl = escapeAttr(dataUrl);
          let indexTitle = -1;
          let indexContent = -1;
          let firstOccur = -1;
          // only match articles with not empty titles and contents
          if (dataTitle !== "" || dataContent !== "") {
            keywords.forEach((keyword, i) => {
              indexTitle = dataTitle.indexOf(keyword);
              indexContent = dataContent.indexOf(keyword);
              if (indexTitle < 0 && indexContent < 0) {
                isMatch = false;
              } else {
                if (indexContent < 0) {
                  indexContent = 0;
                }
                if (i === 0) {
                  firstOccur = indexContent;
                }
              }
            });
          } else {
            isMatch = false;
          }

          // show search results
          if (isMatch) {
            if (firstOccur >= 0) {
              // cut out 130 characters
              // let start = firstOccur - 30 < 0 ? 0 : firstOccur - 30
              // let end = firstOccur + 50 > dataContent.length ? dataContent.length : firstOccur + 50
              let start = firstOccur - 30;
              let end = firstOccur + 100;
              let pre = "";
              let post = "";

              if (start < 0) {
                start = 0;
              }

              if (start === 0) {
                end = 100;
              } else {
                pre = "...";
              }

              if (end > dataContent.length) {
                end = dataContent.length;
              } else {
                post = "...";
              }

              let matchContent = rawContent.substring(start, end);
              const titleHtml = highlightText(rawTitle, keywords);
              const contentHtml = highlightText(matchContent, keywords);

              str += '<div class="local-search__hit-item">';
              if (oneImage) {
                str += `<div class="search-left"><img src="${escapeAttr(oneImage)}" alt="${escapeAttr(rawTitle)}" loading="lazy">`;
              } else {
                str += '<div class="search-left" style="width:0">';
              }

              str += "</div>";

              if (oneImage) {
                str +=
                  '<div class="search-right"><a href="' +
                  safeDataUrl +
                  '" class="search-result-title">' +
                  titleHtml +
                  "</a>";
              } else {
                str +=
                  '<div class="search-right" style="width: 100%"><a href="' +
                  safeDataUrl +
                  '" class="search-result-title">' +
                  titleHtml +
                  "</a>";
              }

              count += 1;

              if (dataContent !== "") {
                str +=
                  '<p class="search-result" onclick="pjax.loadUrl(`' +
                  safeDataUrl +
                  '`)">' +
                  pre +
                  contentHtml +
                  post +
                  "</p>";
              }
              if (dataTags.length) {
                str += '<div class="search-result-tags">';

                for (let i = 0; i < dataTags.length; i++) {
                  const element = dataTags[i].trim();
                  const tagUrl = encodeURIComponent(element);

                  str +=
                    '<a class="tag-list" href="/tags/' +
                    tagUrl +
                    '/" data-pjax-state="" one-link-mark="yes">#' +
                    escapeHtml(element) +
                    "</a>";
                }

                str += "</div>";
              }
            }
            str += "</div></div>";
          }
        });
        if (count === 0) {
          str +=
            '<div id="local-search__hits-empty">' +
            GLOBAL_CONFIG.localSearch.languages.hits_empty.replace(/\$\{query}/, escapeHtml(searchText)) +
            "</div>";
        }
        str += "</div>";
        $resultContent.innerHTML = str;
        if (keywords[0] !== "") $loadingStatus.innerHTML = "";
        window.pjax && window.pjax.refresh($resultContent);
      }).catch(error => {
        console.error("Local search failed:", error);
        $loadingStatus.innerHTML = "";
        $resultContent.innerHTML = '<div id="local-search__hits-empty">搜索失败，请刷新页面后重试</div>';
      });
      }, 160);
    });
  };

  searchClickFn();
  searchClickFnOnce();

  // pjax
  window.addEventListener("pjax:complete", () => {
    !anzhiyu.isHidden($searchMask) && closeSearch();
    searchClickFn();
  });
});
