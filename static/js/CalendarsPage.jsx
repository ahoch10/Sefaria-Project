import {
  InterfaceText,
  ResponsiveNBox,
} from './Misc';
import React, { useState } from 'react';
import classNames  from 'classnames';
import Sefaria  from './sefaria/sefaria';
import $  from './sefaria/sefariaJquery';
import { NavSidebar, Modules }from './NavSidebar';
import Footer  from './Footer';
import Component from 'react-class';


const CalendarsPage = ({multiPanel, initialWidth}) => {

  const calendars = reformatCalendars();

  const parashaCalendars = ["Parashat Hashavua", "Haftarah (A)", "Haftarah (S)", "Haftarah"];
  const dailyCalendars   = ["Daf Yomi", "929", "Daily Mishnah", "Daily Rambam", "Daily Rambam (3 Chapters)", "Halakhah Yomit"];
  const weeklyCalendars  = ["Daf a Week"];

  const makeListings = list => calendars.filter(c => list.indexOf(c.title.en) != -1)
                              .map(c => <CalendarListing calendar={c} />);

  const parashaListings = makeListings(parashaCalendars);
  const dailyListings   = makeListings(dailyCalendars);
  const weeklyListings  = makeListings(weeklyCalendars);

  const about = multiPanel ? null :
    <Modules type={"AboutLearningSchedules"} />

  const sidebarModules = [
    multiPanel ? {type: "AboutLearningSchedules"} : {type: null},
    {type: "StayConnected"},
    {type: "SupportSefaria"},
  ];

  return (
    <div className="readerNavMenu" key="0">
      <div className="content">
        <div className="sidebarLayout">
          <div className="contentInner">
            {about}
            <h2 className="styledH1 sans-serif"><InterfaceText>Weekly Torah Portion</InterfaceText></h2>
            <div className="readerNavCategories">
              <ResponsiveNBox content={parashaListings} initialWidth={initialWidth} />
            </div>
            <h2 className="styledH1 sans-serif"><InterfaceText>Daily Learning</InterfaceText></h2>
            <div className="readerNavCategories">
              <ResponsiveNBox content={dailyListings} initialWidth={initialWidth} />
            </div>
            <h2 className="styledH1 sans-serif"><InterfaceText>Weekly Learning</InterfaceText></h2>
            <div className="readerNavCategories">
              <ResponsiveNBox content={weeklyListings} initialWidth={initialWidth} />
            </div>
          </div>
          <NavSidebar modules={sidebarModules} />
        </div>
        <Footer />
      </div>
    </div>
  );
};


const CalendarListing = ({calendar}) => {
  const style = {"borderColor": Sefaria.palette.categoryColor(calendar.category)};
  return (
    <div className="navBlock withColorLine" style={style}>
      <a href={`/${calendar.url}`} className="navBlockTitle">
        <InterfaceText text={calendar.displayTitle} />
        {calendar.enSubtitle ?
        <span className="subtitle">
          &nbsp;<InterfaceText text={{en: calendar.enSubtitle, he: ""}} />
        </span> : null }
      </a>
      <div className="calendarRefs">
        {calendar.refs.map(ref => (
        <div className="calendarRef" key={ref.url}>
          <img src="/static/icons/book.svg" className="navSidebarIcon" alt="book icon" />
          <a href={`/${ref.url}`} className="">
            <InterfaceText text={ref.displayValue} />
          </a>
        </div>
        ))}
      </div>          
      { calendar.description ?
      <div className="navBlockDescription">
        <InterfaceText text={calendar.description} />
      </div>
      : null}
    </div>
  );
};


const reformatCalendars = () => {
  // Reformats the calendar data as it is given by the API into the shape we need,
  // combining with descriptions written here.
  const calendars = Sefaria.util.clone(Sefaria.calendars);
  const mergedCalendars = [];
  calendars.map(cal => {
    let calData = calendarDescriptions[cal.title.en.replace(/ \([AS]\)$/, "")]
    if (!cal.description && calData) {
      cal.description = {en: calData.en, he: calData.he};
    }
    if (cal.title.en === "Parashat Hashavua") {
      cal.displayTitle = cal.displayValue;
      cal.displayValue = {en: cal.ref, he: cal.heRef};
    } else {
      cal.displayTitle = Sefaria.util.clone(cal.title);
      if (calData && calData.enSubtitle) {
        cal.enSubtitle = calData.enSubtitle;
      }
    }

    // Merge multiple calendar entries that from from the same schedule
    // (e.g., when a Haftarah has multiple refs)
    let len = mergedCalendars.length;
    if (len && cal.title.en === mergedCalendars[len-1].title.en) {
      mergedCalendars[len-1].refs.push({url: cal.url, displayValue: cal.displayValue});
    } else {
      cal.refs = [{url: cal.url, displayValue: cal.displayValue}];
      mergedCalendars.push(cal);
    }
  });

  return mergedCalendars;
};


const calendarDescriptions = {
  "Parashat Hashavua": {},
  "Haftarah": {
    en: "The portion from Prophets (a section of the Bible) read on any given week, based on its thematic connection to the weekly Torah portion.",
    he: "קטע קבוע לכל פרשה מספרי הנביאים הנקרא בכל שבת ומועד, ויש לו קשר רעיוני לפרשת השבוע."
  },
  "Daf Yomi": {
    en: "A learning program that covers a page of Talmud a day. In this way, the entire Talmud is completed in about seven and a half years.",
    he: "סדר לימוד לתלמוד הבבלי הכולל לימוד של דף אחד בכל יום. הלומדים בדרך זו מסיימים את קריאת התלמוד כולו בתוך כשבע שנים וחצי.",
    enSubtitle: "(Talmud)",
  },
  "929": {
    en: "A learning program in which participants study five of the Bible’s 929 chapters a week, completing it in about three and a half years.",
    he: "סדר שבועי ללימוד תנ\"ך שבו נלמדים בכל שבוע חמישה מתוך 929 פרקי התנ\"ך. הלומדים בדרך זו מסיימים את קריאת התנ\"ך כולו כעבור שלוש שנים וחצי.",
    enSubtitle: "(Tanakh)"
  },
  "Daily Mishnah": {
    en: "A program of daily learning in which participants study two Mishnahs (teachings) each day in order to finish the entire Mishnah in six years.",
    he: "סדר לימוד משנה שבמסגרתו נלמדות שתי משניות בכל יום. הלומדים בדרך זו מסיימים את קריאת המשנה כולה כעבור שש שנים."
  },
  "Daily Rambam": {
    en: "A learning program that divides Maimonides’ Mishneh Torah legal code into daily units, to complete the whole work in three years.",
    he: "סדר לימוד הספר ההלכתי של הרמב\"ם, \"משנה תורה\", המחלק את הספר ליחידות יומיות. הלומדים בדרך זו מסיימים את קריאת הספר כולו בתוך שלוש שנים."
  },
  "Daily Rambam (3 Chapters)": {
    en: "A learning program that divides Maimonides’ Mishneh Torah legal code into daily units, to complete the whole work in one year.",
    he: "סדר לימוד הספר ההלכתי של הרמב\"ם, \"משנה תורה\", המחלק את הספר ליחידות יומיות. הלומדים בדרך זו מסיימים את קריאת הספר כולו בתוך שנה אחת.",
  },
  "Daf a Week": {
    en: "A learning program  that covers a page of Talmud a week. By going at a slower pace, it facilitates greater mastery and retention.",
    he: "סדר שבועי ללימוד התלמוד הבבלי שבו נלמד דף תלמוד אחד בכל שבוע. קצב הלימוד האיטי מאפשר ללומדים הפנמה ושליטה רבה יותר בחומר הנלמד.",
    enSubtitle: "(Talmud)"
  },
  "Halakhah Yomit": {
    en: "A four year daily learning program in which participants study central legal texts that cover most of the daily and yearly rituals.",
    he: "תוכנית ארבע־שנתית ללימוד מקורות הלכתיים מרכזיים העוסקים ברוב הלכות היום־יום והמועדים."
  },
}


export default CalendarsPage;